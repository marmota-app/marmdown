import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { UpdateParser } from "$markdown/UpdateParser"
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
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

	describe('parsing updates', () => {
		const parsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), }
		const textParser = new MfMTextParser(parsers)
		const originalText = textParser.parseLine(null, '---ignore---the original text---ignore---', '---ignore---'.length, 'the original text'.length) as MfMText
		const updateParser = new UpdateParser()

		it('parses update to text content when update is in range', () => {
			const updated = updateParser.parse(originalText, { text: 'simple ', rangeOffset: '---ignore---'.length+'the '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('text', 'the simple original text')
			expect(updated?.lines[0]).toHaveProperty('start', '---ignore---'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the simple original text'.length)
		})
	})
})