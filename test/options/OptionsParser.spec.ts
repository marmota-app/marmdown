import { ContentChange } from "$markdown/ContentChange"
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

	const textTestData: string[] = ['{}', '{ default }', '{     default; }', '{foo     =     bar; foobar = baz   }']
	textTestData.forEach(options => it(`generates text ${options} after parsing ${options}`, () => {
		const result = parse(options)

		expect(result?.content.text).toEqual(options)
	}))

	describe('partial parsing options', () => {
		it('updates existing option, partially', () => {
			const change: ContentChange = {
				rangeOffset: '{ default;   key'.length, rangeLength: 1, text: 'changed', range: undefined,
			}
			const options = parse('{ default;   key1   = value1; }')?.content
			expect(options).not.toBeNull()

			const result = options!.parsedWith.parsePartial(options!, change)

			expect(result).not.toBeNull()
			expect(result?.content.asMap).toHaveProperty('keychanged', 'value1')
		})

		it('updates existing default option, partially', () => {
			const change: ContentChange = {
				rangeOffset: '{ '.length, rangeLength: 0, text: 'value', range: undefined,
			}
			const options = parse('{ default;   key1   = value1; }')?.content
			expect(options).not.toBeNull()

			const result = options!.parsedWith.parsePartial(options!, change)

			expect(result).not.toBeNull()
			expect(result?.content.asMap).toHaveProperty('default', 'valuedefault')
		})

		it('updates existing default option, at the end of the option', () => {
			const change: ContentChange = {
				rangeOffset: '{ default'.length, rangeLength: 0, text: 'value', range: undefined,
			}
			const options = parse('{ default;   key1   = value1; }')?.content
			expect(options).not.toBeNull()

			const result = options!.parsedWith.parsePartial(options!, change)

			expect(result).not.toBeNull()
			expect(result?.content.asMap).toHaveProperty('default', 'defaultvalue')
		})

		it('updates existing options block outside of option', () => {
			const change: ContentChange = {
				rangeOffset: '{'.length, rangeLength: 0, text: 'defaultvalue;', range: undefined,
			}
			const options = parse('{    key1   = value1; }')?.content
			expect(options).not.toBeNull()
			expect(options?.asMap).toHaveProperty('key1', 'value1')
			expect(options?.asMap).not.toHaveProperty('default')

			const result = options!.parsedWith.parsePartial(options!, change)

			expect(result).not.toBeNull()
			expect(options?.asMap).toHaveProperty('key1', 'value1')
			expect(result?.content.asMap).toHaveProperty('default', 'defaultvalue')
		})

		const textTestData: [string, ContentChange, string][] = [
			['{}', { rangeOffset: 1, rangeLength: 0, text: ' content ', range: undefined }, '{ content }'],
			['{ default }', { rangeOffset: '{ de'.length, rangeLength: 3, text: '', range: undefined }, '{ delt }'],
			['{     default; }', { rangeOffset: 3, rangeLength: 0, text: 'foo =', range: undefined }, '{  foo =   default; }'],
			['{foo=bar}', { rangeOffset: '{foo='.length, rangeLength: 0, text: 'i', range: undefined }, '{foo=ibar}'],
		]
		textTestData.forEach(([options, change, newText]) => it(`updates text to ${newText} after parsing change ${JSON.stringify(change)} in ${options}`, () => {
			const parsed = parse(options)
	
			const result = parsed?.content!.parsedWith.parsePartial(parsed.content!, change)

			expect(result?.content.text).toEqual(newText)
		}))
	
		// **TODO**
		// * indexes
		// * inner parser returned 0
		// * change not inside an inner parser
		// * just bail out if too complicated
	})
})
