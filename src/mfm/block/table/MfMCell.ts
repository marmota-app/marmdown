import { LineContent, ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { ParserUtils } from "../../../parser/Parser"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericLeafInline } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMContentLine, MfMContentLineParser } from "../../inline/MfMContentLine"

export class MfMCell extends MfMGenericLeafInline<
	MfMCell, MfMContentLine, LineContent<MfMCell>, 'table-cell', MfMCellParser
> {
	protected self: MfMCell = this
	constructor(id: string, pw: MfMCellParser) { super(id, 'table-cell', pw) }
}

export class MfMCellParser extends MfMParser<MfMCell, MfMCell, MfMContentLineParser> {
	public readonly elementName = 'MfMTableCell'

	parseLine(previous: MfMCell | null, text: string, start: number, length: number, utils: ParserUtils): MfMCell | null {
		let i = 0
		let trailingStart = 0
		const loop = finiteLoop(() => i, INCREASING)
		while(i < length && text.charAt(start+i) !== '|') {
			loop.guard()

			if(isWhitespace(text.charAt(start+i)) && trailingStart === 0) {
				trailingStart = i
			} else if(!isWhitespace(text.charAt(start+i)) && trailingStart !== 0) {
				trailingStart = 0
			}

			i++
		}

		if(i > 0) {
			const contentLength = trailingStart > 0 ? trailingStart : i
			const lineContent = this.parsers.MfMContentLine.parseLine(null, text, start, contentLength)
			if(lineContent != null) {
				const cell = new MfMCell(this.parsers.idGenerator.nextId(), this)
				cell.addContent(lineContent)
	
				return cell
			}
		}

		return null
	}
}
