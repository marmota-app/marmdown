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
describe('MfMList', () => {
	describe('parsing the content', () => {
		it('parses a simple table that contains onla the delimiter row', () => {
			const tableParser = createTableParser()

			const [table, text] = parseMultiLine(tableParser, [
				'   | --- | -- |     '
			])

			expect(table).not.toBeNull()
		})
	})
	describe('parsing options', () => {})
	describe('parsing updates', () => {})
})
