import { NumberedIdGenerator } from "../../../../src/IdGenerator"
import { CellAlignment, MfMDelimiterCellParser } from "../../../../src/mfm/block/table/MfMDelimiterCell"
import { MfMDelimiterRowParser, RequiredParsers } from "../../../../src/mfm/block/table/MfMDelimiterRow"
import { Parsers } from "../../../../src/parser/Parsers"
import { parseMultiLine } from "../../../parseMultiLine"
import { createOptionsParser } from "../../options/createOptionsParser"
import { createDelimiterRowParser } from "./createTableParsers"

describe('MfMDelimiterRow', () => {
	describe('parsing the content', () => {
		const validDelimiterRows: [string, CellAlignment[]][] = [
			['---', [ 'left' ]],
			['| --- |\t-\t|    -----------|', [ 'left', 'left', 'left' ]],
		]
		validDelimiterRows.forEach(r => it(`parses a valid delimiter row "${r[0]}" as ${JSON.stringify(r[1])}`, () => {
			const parser = createDelimiterRowParser()

			const [row, text] = parseMultiLine(parser, [
				r[0],
			])

			expect(row).not.toBeNull()
			expect(row?.columns).toHaveLength(r[1].length)
			row?.columns.forEach((c, i) => expect(c).toHaveProperty('alignment', r[1][i]))
		}))
	})
	describe('parsing options', () => {})
	describe('parsing updates', () => {})
})
