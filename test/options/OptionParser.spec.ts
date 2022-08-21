import { OptionParser } from "$markdown/options/OptionParser"

describe('OptionParser', () => {
	const optionParser = new OptionParser()

	it('returns option for correctly parsed option', () => {
		const option = 'foo = bar'

		const result = optionParser.parse(option, 0, option.length)

		expect(result).toHaveProperty('startIndex', 0)
		expect(result).toHaveProperty('length', option.length)
		expect(result?.content).toEqual({ key: 'foo', value: 'bar', })
	})

	it('returns null when option could not be parsed', () => {
		const option = ''

		const result = optionParser.parse(option, 0, option.length)

		expect(result).toBeNull()
	})

	it('parses a different named option in the middle of the text', () => {
		const option = 'something. bar = foo'

		const result = optionParser.parse(option, 11, option.length-11)

		expect(result).toHaveProperty('startIndex', 11)
		expect(result).toHaveProperty('length', option.length-11)
		expect(result?.content).toEqual({ key: 'bar', value: 'foo', })
	})

	it('parses default option when allowed', () => {
		const option = 'bar'
		const optionParser = new OptionParser({ allowDefault: true, })

		const result = optionParser.parse(option, 0, option.length)

		expect(result).toHaveProperty('startIndex', 0)
		expect(result).toHaveProperty('length', option.length)
		expect(result?.content).toEqual({ key: 'default', value: 'bar', })
	})

	it('does not parse default option when not allowed', () => {
		const option = 'bar'
		const optionParser = new OptionParser({ allowDefault: false, })

		const result = optionParser.parse(option, 0, option.length)

		expect(result).toBeNull()
	})

	it('parses an option value that contains spaces', () => {
		const option = 'foo = some longer\ttext   \t'

		const result = optionParser.parse(option, 0, option.length)

		expect(result?.content).toEqual({ key: 'foo', value: 'some longer\ttext', })
		expect(result).toHaveProperty('startIndex', 0)
		expect(result).toHaveProperty('length', option.length)
	})

	describe('special cases ending the idents', () => {
		[
			['\n', 'newline',],
			['\r', 'cr',],
			['\t', 'tab',],
			['}', '}',],
			[';', ';',],
		].forEach(tc => it(`parses a default option ended by "${tc[1]}"`, () => {
			const option = `bar${tc[0]}ignoreme`
			const optionParser = new OptionParser({ allowDefault: true, })
	
			const result = optionParser.parse(option, 0, option.length)
	
			expect(result).toEqual({length: 3, content: { key: 'default', value: 'bar', }, startIndex: 0, })
		}))

		it('parses named option ended by "="', () => {
			const option = 'foo=bar'
	
			const result = optionParser.parse(option, 0, option.length)
	
			expect(result).toHaveProperty('startIndex', 0)
			expect(result).toHaveProperty('length', option.length)
			expect(result?.content).toEqual({ key: 'foo', value: 'bar', })
		})	
	})
})
