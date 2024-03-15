import { NumberedIdGenerator } from "../../../../src/IdGenerator"
import { MfMDelimiterRowParser } from "../../../../src/mfm/block/table/MfMDelimiterRow"
import { MfMTableParser, RequiredParsers } from "../../../../src/mfm/block/table/MfMTable"
import { MfMHeaderRowParser, RequiredParsers as HeaderRequiredParsers } from "../../../../src/mfm/block/table/MfMHeaderRow"
import { RequiredParsers as DelimiterRequiredParsers } from "../../../../src/mfm/block/table/MfMDelimiterRow"
import { Parsers } from "../../../../src/parser/Parsers"
import { parseMultiLine } from "../../../parseMultiLine"
import { createOptionsParser } from "../../options/createOptionsParser"
import { MfMDelimiterCellParser } from "../../../../src/mfm/block/table/MfMDelimiterCell"
import { MfMCellParser } from "../../../../src/mfm/block/table/MfMCell"
import { createTableParser } from "./createTableParsers"

describe('MfMTable', () => {
	describe('parsing the content', () => {
		it('parses a simple table that contains onla the delimiter row', () => {
			const tableParser = createTableParser()

			const [table, text] = parseMultiLine(tableParser, [
				'| --- | -- |     ',
			])

			expect(table).not.toBeNull()
		})

		it('does not parse a table that does not contain a delimiter row', () => {
			const tableParser = createTableParser()

			const [table, text] = parseMultiLine(tableParser, [
				'foobar',
			])

			expect(table).toBeNull()
		})

		it('parses a table when the second line is a delimiter row and the columns match', () => {
			const tableParser = createTableParser()

			const [table, text] = parseMultiLine(tableParser, [
				'foo | bar',
				'| --- | -- |     ',
			])

			expect(table).not.toBeNull()
		})
		it('does not parse table when the header row and delimiter row don\'t have matching columns', () => {
			const tableParser = createTableParser()

			const [table, text] = parseMultiLine(tableParser, [
				'foo | bar | baz',
				'| --- | -- |     ',
			])

			expect(table).toBeNull()
		})
	})
	describe('parsing options', () => {})
	describe('parsing updates', () => {})
})
