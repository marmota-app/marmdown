import { ParsedLine, StringLineContent } from "../../../element/Element"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { ParserUtils } from "../../../parser/Parser"
import { Parsers } from "../../../parser/Parsers"
import { isWhitespace } from "../../../parser/isWhitespace"
import { MfMGenericBlock } from "../../MfMGenericElement"
import { MfMParser } from "../../MfMParser"
import { MfMOptionsParser } from "../../options/MfMOptions"
import { AbstractTableRowParser } from "./AbstractTableRow"
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
export class MfMHeaderRowParser extends AbstractTableRowParser<MfMCell, MfMHeaderRow, RequiredParsers, MfMHeaderRowParser> {
	public readonly elementName = 'MfMTableHeaderRow'
	protected readonly self = this

	constructor(parsers: Parsers<RequiredParsers>) {
		super(parsers, (id, pw) => new MfMHeaderRow(id, pw), parsers.MfMTableCell)
	}
}
