import { ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { ParserUtils } from "../../../parser/Parser"
import { Parsers } from "../../../parser/Parsers"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericBlock } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMOptionsParser } from "../../options/MfMOptions"
import { AbstractTableRowParser } from "./AbstractTableRow"
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
export class MfMDelimiterRowParser extends AbstractTableRowParser<MfMDelimiterCell, MfMDelimiterRow, RequiredParsers, MfMDelimiterRowParser> {
	public readonly elementName = 'MfMTableDelimiterRow'
	protected readonly self = this

	constructor(parsers: Parsers<RequiredParsers>) {
		super(parsers, (id, pw) => new MfMDelimiterRow(id, pw), parsers.MfMTableDelimiterCell)
	}
}
