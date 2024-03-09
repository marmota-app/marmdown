import { Table } from "../../element/MarkdownElements"
import { MfMGenericContainerBlock } from "../MfMGenericElement"
import { MfMParser } from "../MfMParser"
import { MfMOptionsParser } from "../options/MfMOptions"

export type TableContent = any
export class MfMTable extends MfMGenericContainerBlock<
	MfMTable, TableContent, 'table', MfMTableParser
> implements Table<MfMTable, TableContent> {
	protected self: MfMTable = this
	constructor(id: string, pw: MfMTableParser) { super(id, 'table', pw) }
}

export type RequiredParsers = MfMOptionsParser
export class MfMTableParser extends MfMParser<MfMTable, MfMTable, RequiredParsers> {
	public readonly elementName = 'MfMTable'

	parseLine(previous: MfMTable | null, text: string, start: number, length: number): MfMTable | null {
		return new MfMTable(this.parsers.idGenerator.nextId(), this)
	}
}
