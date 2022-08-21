import { OptionsParser } from "$markdown/options/OptionsParser"

describe('OptionsParser', () => {
	const optionsParser = new OptionsParser()

	function parse(text: string) {
		return optionsParser.parse(text, 0, text.length)
	}

	it('parses empty options when document contains empty options block', () => {
		const result = parse('{}')

		expect(result).not.toBeNull()
		expect(result?.startIndex).toEqual(0)
		expect(result?.length).toEqual(2)
		expect(result?.content.asMap).toEqual({})
	})
	it('does not parse options when the closing curly bracket is missing', () => {
		const result = parse('{')

		expect(result).toBeNull()
	})

	it('parses key-value option at start of the options block', () => {
		const options = '{ foo = bar}'

		const result = parse(options)

		expect(result?.content.asMap).toHaveProperty('foo', 'bar')
		expect(result?.length).toEqual(options.length)
	})

	it('parses default option at start of the options block', () => {
		const options = '{ the-value }'

		const result = parse(options)

		expect(result?.content.asMap).toHaveProperty('default', 'the-value')
		expect(result?.length).toEqual(options.length)
	})

	it('parses named option after default option', () => {
		const options = '{ the-value; k1 = v1 }'

		const result = parse(options)

		expect(result?.content.asMap).toHaveProperty('k1', 'v1')
		expect(result?.content.options.length).toEqual(2)
	})
	it('parses named option after named option', () => {
		const options = '{ k1 = v1; k2 = v2 }'

		const result = parse(options)

		expect(result?.content.asMap).toHaveProperty('k2', 'v2')
		expect(result?.content.options.length).toEqual(2)
	})

	it('stops parsing when there is a default option after a named option', () => {
		const options = '{ k1 = v1; illegal-value }'

		const result = parse(options)

		expect(result).toBeNull()
	})
})
