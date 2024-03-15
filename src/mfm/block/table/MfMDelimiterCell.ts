import { LineContent, ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { ParserUtils } from "../../../parser/Parser"
import { MfMGenericLeafInline } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMOptionsParser } from "../../options/MfMOptions"

export type CellAlignment = 'left' | 'center' | 'right'
export class MfMDelimiterCell extends MfMGenericLeafInline<
	MfMDelimiterCell, never, LineContent<MfMDelimiterCell>, 'table-delimiter-cell', MfMDelimiterCellParser
> {
	protected self: MfMDelimiterCell = this
	constructor(id: string, pw: MfMDelimiterCellParser) { super(id, 'table-delimiter-cell', pw) }

	get alignment(): CellAlignment {
		return 'left'
	}
}

export class MfMDelimiterCellParser extends MfMParser<MfMDelimiterCell, MfMDelimiterCell, never> {
	public readonly elementName = 'MfMTableDelimiterCell'

	parseLine(previous: MfMDelimiterCell | null, text: string, start: number, length: number, utils: ParserUtils): MfMDelimiterCell | null {
		let i = 0
		const loop = finiteLoop(() => i, INCREASING)
		while(text.charAt(start+i) === ':' || text.charAt(start+i) === '-') {
			loop.guard()
			i++
		}
		const foundText = text.substring(start, start+i)
		if(foundText.match(/^\:?\-+\:?$/) != null) {
			const cell = new MfMDelimiterCell(this.parsers.idGenerator.nextId(), this)
			cell.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), cell))
			cell.lines[0].content.push(new StringLineContent(foundText, start, i, cell))
			return cell
		}
		return null
	}
}
