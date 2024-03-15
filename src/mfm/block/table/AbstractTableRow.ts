import { Element, ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { Parser, ParserUtils } from "../../../parser/Parser"
import { Parsers } from "../../../parser/Parsers"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericBlock } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"

export interface Row<
	ID extends string,
	R extends Row<ID, R, PARSER, CELL>,
	PARSER extends MfMParser<R, R, any>,
	CELL extends Element<unknown, unknown, unknown, unknown>,
> extends MfMGenericBlock<
	R, CELL, ID, PARSER
> {}

export abstract class AbstractTableRowParser<
	CELL extends Element<unknown, unknown, unknown, unknown>,
	ROW extends Row<any, any, any, CELL>,
	PARSERS extends Parser<Element<unknown, unknown, unknown, unknown>, Element<unknown, unknown, unknown, unknown>, any>,
	SELF extends AbstractTableRowParser<CELL, ROW, PARSERS, SELF>,
> extends MfMParser<ROW, ROW, PARSERS> {
	public abstract readonly elementName: string
	protected abstract readonly self: SELF

	constructor(parsers: Parsers<PARSERS>, private newRow: (id: string, pw: SELF) => ROW, private cellParser: Parser<CELL, CELL, any>) {
		super(parsers)
	}

	parseLine(previous: ROW | null, text: string, start: number, length: number, utils: ParserUtils): ROW | null {
		const row = this.newRow(this.parsers.idGenerator.nextId(), this.self)
		row.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), row))

		let i = 0
		let last = 0

		const loop = finiteLoop(() => i, INCREASING)
		while(i < length) {
			loop.guard()

			while(text.charAt(start+i) === '|' || isWhitespace(text.charAt(start+i))) {
				i++
			}
			if(i > last) {
				row.lines[0].content.push(new StringLineContent(text.substring(start+last, start+i), start, i-last, row))
				last = i
			}
			
			const cell = this.cellParser.parseLine(null, text, start+last, length-last, utils)
			if(cell == null) { break }
			row.addContent(cell)
			i += cell.lines[cell.lines.length-1].length
			last = i

			while(isWhitespace(text.charAt(start+i))) {
				i++
			}
			if(i > last) {
				row.lines[0].content.push(new StringLineContent(text.substring(start+last, start+i), start, i-last, row))
				last = i
			}	
		}
		if(i !== length) { return null }

		return row
	}
}
