import { OptionsParser } from "$markdown/options/OptionsParser"

describe('OptionsParser', () => {
	const optionsParser = new OptionsParser()

	function parse(text: string) {
		return optionsParser.parse(text, 0, text.length)
	}
	it.skip('parses empty options when document contains empty options block', () => {
		const result = parse('{}')

		expect(result).not.toBeNull()
		expect(result?.startIndex).toEqual(0)
		expect(result?.length).toEqual(2)
		expect(result?.content).toEqual({})
	})

	/*
	it('parses empty options with whitespace', () => {
		const options = '{  \t  }'
		const result = parse(options)

		expect(result).not.toBeNull()
		expect(result?.startIndex).toEqual(0)
		expect(result?.length).toEqual(options.length)
		expect(result?.content).toEqual({})
	})

	it('does not parse options block when there is no starting {', () => {
		const result = parse('} ')

		expect(result).toBeNull()
	})

	it('parses key-value option at start of the options block', () => {
		const options = '{ foo = bar}'

		const result = parse(options)

		expect(result?.content).toHaveProperty('foo', 'bar')
		expect(result?.length).toEqual(options.length)
	})

	it('parses default option at start of the options block', () => {
		const options = '{ the-value }'

		const result = parse(options)

		expect(result?.content).toHaveProperty('default', 'the-value')
		expect(result?.length).toEqual(options.length)
	})
	*/
})
