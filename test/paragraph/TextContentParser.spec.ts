import { TextContentParser } from "$markdown/paragraph/TextContentParser"

describe('TextContentParser', () => {
	it('parses given text completely', () => {
		const markdown = 'ignore me;this is the text;ignore me'
		const startIndex = 'ignore me;'.length
		const length = 'this is the text'.length

		const result = new TextContentParser().parse(markdown, startIndex, length)

		expect(result).toHaveProperty('startIndex', startIndex)
		expect(result).toHaveProperty('length', length)

		
		expect(result?.content).toHaveProperty('type', 'Text')
		expect(result?.content).toHaveProperty('content', 'this is the text')
		expect(result?.content).toHaveProperty('asText', 'this is the text')
		expect(result?.content).toHaveProperty('start', startIndex)
		expect(result?.content).toHaveProperty('length', length)
	})
})
