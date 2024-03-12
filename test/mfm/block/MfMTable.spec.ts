import { NumberedIdGenerator } from "../../../src/IdGenerator"
import { MfMElement, MfMParser } from "../../../src/mfm/MfMParser"
import { MfMTableParser, RequiredParsers } from "../../../src/mfm/block/MfMTable"
import { Parsers } from "../../../src/parser/Parsers"
import { parseMultiLine } from "../../parseMultiLine"
import { createOptionsParser } from "../options/createOptionsParser"

function createTableParser() {
	const optionsParser = createOptionsParser()
	const requiredParsers: Parsers<RequiredParsers> = {
		'MfMOptions': optionsParser,
		allBlocks: [],
		idGenerator: new NumberedIdGenerator(),
	}
	return new MfMTableParser(requiredParsers)
}
describe('MfMTable', () => {
	describe('determining delimiter rows', () => {
		const validDelimiterRows: string[] = [
			'|-|',
			'-',
			'--- | ---',
			':-----\t|',
			'|\t   :-:',
			'| --- | --- | --- | --- |',
			' --- | --- | --- | --- |',
			'| --- | --- | --- | --- ',
			' --- | --- | --- | --- ',
		];
		validDelimiterRows.forEach(row => it(`recognizes valid delimiter row "${row}`, () => {
			const tableParser = createTableParser()
			expect(tableParser.isDelimiterRow(row)).toEqual(true)
		}))

		const invalidDelimiterRows: string[] = [
			'-:-',
			'||',
			'|           |',
			'| --- | ::',
			'| a |',
			'| --- |     a',
		];
		invalidDelimiterRows.forEach(row => it(`does not recognize invalid delimiter row "${row}"`, () => {
			const tableParser = createTableParser()
			expect(tableParser.isDelimiterRow(row)).toEqual(false)
		}))
	})
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
