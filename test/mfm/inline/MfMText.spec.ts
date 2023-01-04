import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { Parsers } from "$parser/Parsers"

describe('MfMText', () => {
	describe('parsing the content', () => {
		it('parses simple text as string content', () => {
			const parsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), }
			const textParser = new MfMTextParser(parsers)

			const text = textParser.parseLine(null, 'the text', 0, 'the text'.length)

			expect(text).toHaveProperty('text', 'the text')
		})
	})
	describe.skip('parsing the content lines', () => {
		//TODO implement me
	})
	describe.skip('parsing updates', () => {
		//TODO implement me
	})
})