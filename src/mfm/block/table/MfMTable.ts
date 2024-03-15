import { Table } from "../../../element/MarkdownElements"
import { ParserUtils } from "../../../parser/Parser"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericContainerBlock } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMOptionsParser } from "../../options/MfMOptions"
import { MfMDelimiterRow, MfMDelimiterRowParser } from "./MfMDelimiterRow"
import { MfMHeaderRow, MfMHeaderRowParser } from "./MfMHeaderRow"

export type TableContent = any //FIXME
export class MfMTable extends MfMGenericContainerBlock<
	MfMTable, TableContent, 'table', MfMTableParser
> implements Table<MfMTable, TableContent> {
	protected self: MfMTable = this
	constructor(id: string, pw: MfMTableParser) { super(id, 'table', pw) }
}

export type RequiredParsers = MfMOptionsParser | MfMDelimiterRowParser | MfMHeaderRowParser
export class MfMTableParser extends MfMParser<MfMTable, MfMTable, RequiredParsers> {
	public readonly elementName = 'MfMTable'

	parseLine(previous: MfMTable | null, text: string, start: number, length: number, utils: ParserUtils): MfMTable | null {
		//TODO: Leading whitespace should not be handled by every parser, but
		//      centrally. At the moment, that's not the case, so this parser
		//      does not behave like the others.
		if(isWhitespace(text.charAt(start))) { return null }

		var headerRow: MfMHeaderRow | null = null
		var delimiterRow: MfMDelimiterRow | null = this.parsers['MfMTableDelimiterRow'].parseLine(null, text, start, length, utils)

		if(delimiterRow === null) {
			const lookahead = utils?.lookahead()
			if(lookahead != null) {
				const [lookaheadStart, lookaheadLength] = lookahead
				delimiterRow = this.parsers['MfMTableDelimiterRow'].parseLine(null, text, lookaheadStart, lookaheadLength, utils)
				if(delimiterRow != null) {
					headerRow = this.parsers['MfMTableHeaderRow'].parseLine(null, text, start, length, utils)
				}
			}
		}
		const hasMatchingColumnHeaders = headerRow ? delimiterRow?.columns.length === headerRow.columns.length : true
		if(delimiterRow && hasMatchingColumnHeaders) {
			return new MfMTable(this.parsers.idGenerator.nextId(), this)
		}
		return null
	}

}
