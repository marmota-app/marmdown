import { LineContentParser } from "$markdown/paragraph/LineContentParser"

describe('LineContentParser', () => {
	const lineParser = new LineContentParser()
	function parse(text: string, start: number = 0) {
		return lineParser.parse(text, start, text.length)
	}

	it('parses string until the end when there is no newline', () => {
		const result = parse('lorem ipsum')

		expect(result?.content.parts).toHaveLength(1)
		expect(result?.content.parts[0]).toHaveProperty('type', 'Text')
		expect(result?.content.parts[0]).toHaveProperty('content', 'lorem ipsum')
	})

	const newLineTestData = [ ['\n', '\\n'], ['\r', '\\r'], ['\r\n', '\\r\\n'], ]
	newLineTestData.forEach(([separator, name]) => it(`parses string until newline separator "${name}"`, () => {
		const result = parse(`lorem${separator}ipsum`)

		expect(result).toHaveProperty('length', `lorem${separator}`.length)
		expect(result?.content.parts).toHaveLength(2)
		expect(result?.content.parts[0]).toHaveProperty('type', 'Text')
		expect(result?.content.parts[0]).toHaveProperty('content', 'lorem')
		expect(result?.content.parts[1]).toHaveProperty('type', 'Newline')
	}))
})
