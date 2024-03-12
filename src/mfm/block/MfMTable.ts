import { Table } from "../../element/MarkdownElements"
import { ParserUtils } from "../../parser/Parser"
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

export interface MfMTableRow {
	columns: string[],
}
export interface MfMColumnDelimiter {
	alignment: 'left' | 'center' | 'right',
}
export interface MfMDelimiterRow {
	columns: MfMColumnDelimiter[],
}

export type RequiredParsers = MfMOptionsParser
export class MfMTableParser extends MfMParser<MfMTable, MfMTable, RequiredParsers> {
	public readonly elementName = 'MfMTable'

	parseLine(previous: MfMTable | null, text: string, start: number, length: number, utils: ParserUtils): MfMTable | null {
		const line = text.substring(start, start+length).trim()

		var headerRow: MfMTableRow | undefined
		var delimiterRow: MfMDelimiterRow | undefined

		if(this.isDelimiterRow(line)) {
			delimiterRow = this.parseDelimiterRow(line)
		} else {
			const lookahead = utils?.lookahead()
			if(lookahead != null) {
				const [lookaheadStart, lookaheadLength] = lookahead
				const nextLine = text.substring(lookaheadStart, lookaheadStart+lookaheadLength).trim()
				if(this.isDelimiterRow(nextLine)) {
					headerRow = this.parseHeaderRow(line)
					delimiterRow = this.parseDelimiterRow(nextLine)
				}
			}
		}
		const hasMatchingColumnHeaders = headerRow ? delimiterRow?.columns.length === headerRow.columns.length : true
		if(delimiterRow && hasMatchingColumnHeaders) {
			return new MfMTable(this.parsers.idGenerator.nextId(), this)
		}
		return null
	}
	parseHeaderRow(line: string): MfMTableRow | undefined {
		const lineContents = line.split('|').filter(c => c.length > 0)
		return {
			columns: lineContents.map(c => c.trim()),
		}
	}

	parseDelimiterRow(line: string): MfMDelimiterRow | undefined {
		const lineContents = line.split('|').filter(c => c.length > 0)
		return {
			columns: lineContents.map(c => {
				return { alignment: 'left' }
			}),
		}
	}

	isDelimiterRow(line: string): boolean {
		return line.match(/^\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?$/) !== null
		//                 \+-/\--------+-------/\----------+----------/\+/
		//                  |           |                   |            \- Ending pipe is optional
		//                  |           |                   \- 0 or more column delimiter strings,
		//                  |           |                      starting with a pipe
		//                  |           \- Delimiter String: Whitespace, an optional colon, at least
		//                  |              one minus, another optional colon and more whitespace
		//                  \- The trimmed string starts with an optional pipe
	}
}
