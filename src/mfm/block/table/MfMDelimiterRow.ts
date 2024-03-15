import { ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { ParserUtils } from "../../../parser/Parser"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericBlock } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMOptionsParser } from "../../options/MfMOptions"
import { MfMDelimiterCell, MfMDelimiterCellParser } from "./MfMDelimiterCell"

export type DelimiterRowContent = MfMDelimiterCell
export class MfMDelimiterRow extends MfMGenericBlock<
	MfMDelimiterRow, DelimiterRowContent, 'table-delimiter-row', MfMDelimiterRowParser
> {
	protected self: MfMDelimiterRow = this
	constructor(id: string, pw: MfMDelimiterRowParser) { super(id, 'table-delimiter-row', pw) }

	get columns(): MfMDelimiterCell[] {
		return this.content
	}
}

export type RequiredParsers = MfMOptionsParser | MfMDelimiterCellParser
export class MfMDelimiterRowParser extends MfMParser<MfMDelimiterRow, MfMDelimiterRow, RequiredParsers> {
	public readonly elementName = 'MfMTableDelimiterRow'

	parseLine(previous: MfMDelimiterRow | null, text: string, start: number, length: number, utils: ParserUtils): MfMDelimiterRow | null {
		const row = new MfMDelimiterRow(this.parsers.idGenerator.nextId(), this)
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
			
			const cell = this.parsers['MfMTableDelimiterCell'].parseLine(null, text, start+last, i-last, utils)
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
