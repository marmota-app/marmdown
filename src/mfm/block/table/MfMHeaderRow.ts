import { ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { ParserUtils } from "../../../parser/Parser"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericBlock } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMOptionsParser } from "../../options/MfMOptions"
import { MfMCell, MfMCellParser } from "./MfMCell"

export type HeaderRowContent = any //FIXME
export class MfMHeaderRow extends MfMGenericBlock<
	MfMHeaderRow, HeaderRowContent, 'table-header-row', MfMHeaderRowParser
> {
	protected self: MfMHeaderRow = this
	constructor(id: string, pw: MfMHeaderRowParser) { super(id, 'table-header-row', pw) }

	get columns(): MfMCell[] {
		return this.content
	}
}

export type RequiredParsers = MfMOptionsParser | MfMCellParser
export class MfMHeaderRowParser extends MfMParser<MfMHeaderRow, MfMHeaderRow, RequiredParsers> {
	public readonly elementName = 'MfMTableHeaderRow'

	parseLine(previous: MfMHeaderRow | null, text: string, start: number, length: number, utils: ParserUtils): MfMHeaderRow | null {
		const row = new MfMHeaderRow(this.parsers.idGenerator.nextId(), this)
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
			
			const cell = this.parsers['MfMTableCell'].parseLine(null, text, start+last, length-last, utils)
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
