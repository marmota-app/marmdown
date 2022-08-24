import { ContentChange } from "$markdown/ContentChange"
import { UpdatableOption } from "$markdown/MarkdownOptions"
import { OptionParser } from "$markdown/options/OptionParser"

describe('OptionParser', () => {
	const optionParser = new OptionParser()

	it('returns option for correctly parsed option', () => {
		const option = 'foo = bar'

		const result = optionParser.parse(option, 0, option.length)

		expect(result).toHaveProperty('startIndex', 0)
		expect(result).toHaveProperty('length', option.length)
		expect(result?.content).toHaveProperty('key', 'foo')
		expect(result?.content).toHaveProperty('value', 'bar')
		expect(result?.content).toHaveProperty('text', 'foo = bar')
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
		expect(result?.content).toHaveProperty('key', 'bar')
		expect(result?.content).toHaveProperty('value', 'foo')
		expect(result?.content).toHaveProperty('text', 'bar = foo')
	})

	it('parses default option when allowed', () => {
		const option = 'bar'
		const optionParser = new OptionParser({ allowDefault: true, })

		const result = optionParser.parse(option, 0, option.length)

		expect(result).toHaveProperty('startIndex', 0)
		expect(result).toHaveProperty('length', option.length)
		expect(result?.content).toHaveProperty('key', 'default')
		expect(result?.content).toHaveProperty('value', 'bar')
		expect(result?.content).toHaveProperty('text', 'bar')
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

		expect(result?.content).toHaveProperty('key', 'foo')
		expect(result?.content).toHaveProperty('value', 'some longer\ttext')
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
	
			expect(result).toHaveProperty('length', 3)
			expect(result).toHaveProperty('startIndex', 0)
			expect(result?.content).toHaveProperty('key', 'default')
			expect(result?.content).toHaveProperty('value', 'bar')
		}))

		it('parses named option ended by "="', () => {
			const option = 'foo=bar'
	
			const result = optionParser.parse(option, 0, option.length)
	
			expect(result).toHaveProperty('startIndex', 0)
			expect(result).toHaveProperty('length', option.length)
			expect(result?.content).toHaveProperty('key', 'foo')
			expect(result?.content).toHaveProperty('value', 'bar')
		})	
	})

	describe('partially parsing changes', () => {
		interface ExpectedResult { text: string, key: string, value: string, length: number, }

		const existingOption = new UpdatableOption('foo = bar', 'foo', 'bar', 5, 'foo = bar'.length)
		existingOption.parent = { text: '', start: 3, length: 4, parent: undefined, previous: undefined, }
		existingOption.previous = { text: '', start: 6, length: 6, parent: undefined, previous: undefined, }
		//Start of the option is 12, because of "previous"!
		const data: [ ContentChange, ExpectedResult | null, ][] = [
			[{ rangeOffset: 10, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 50, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 12, rangeLength: 0, text: 'i', range: undefined }, { text: 'ifoo = bar', key: 'ifoo', value: 'bar', length: 'ifoo = bar'.length}],
			[{ rangeOffset: 18, rangeLength: 0, text: 'i', range: undefined }, { text: 'foo = ibar', key: 'foo', value: 'ibar', length: 'foo = ibar'.length}],
			[{ rangeOffset: 12, rangeLength: 2, text: '', range: undefined }, { text: 'o = bar', key: 'o', value: 'bar', length: 'o = bar'.length}],
			[{ rangeOffset: 12, rangeLength: 3, text: 'baz', range: undefined }, { text: 'baz = bar', key: 'baz', value: 'bar', length: 'baz = bar'.length}],
			[{ rangeOffset: 14, rangeLength: 0, text: ';', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: ' ', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: '=', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: '\n', range: undefined }, null],
			[{ rangeOffset: 19, rangeLength: 0, text: ';', range: undefined }, null],
			[{ rangeOffset: 19, rangeLength: 0, text: '\n', range: undefined }, null],
			[{ rangeOffset: 19, rangeLength: 10, text: '', range: undefined }, null],
		]
		data.forEach(d => it(`parses content change ${JSON.stringify(d[0])} as ${JSON.stringify(d[1])}`, () => {
			const result = optionParser.parsePartial(existingOption, d[0])

			if(d[1] === null) {
				expect(result).toBeNull()
			} else {
				expect(result?.content).toHaveProperty('text', d[1].text)
				expect(result?.content).toHaveProperty('key', d[1].key)
				expect(result?.content).toHaveProperty('value', d[1].value)
				expect(result?.content).toHaveProperty('length', d[1].length)
				expect(result?.content).toHaveProperty('start', existingOption.start)
				expect(result?.content).toHaveProperty('previous', existingOption.previous)
				expect(result?.content).toHaveProperty('parent', existingOption.parent)
			}
		}))

		const existingDefaultOption = new UpdatableOption('bar', 'default', 'bar', 12, 'bar'.length)
		existingDefaultOption.parent = { text: '', start: 3, length: 4, parent: undefined, previous: undefined, }
		existingDefaultOption.previous = { text: '', start: 6, length: 6, parent: undefined, previous: undefined, }
		//Start of the option is 12, because of "previous"!
		const defaultOptionData: [ ContentChange, ExpectedResult | null, ][] = [
			[{ rangeOffset: 10, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 50, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 12, rangeLength: 0, text: 'i', range: undefined }, { text: 'ibar', key: 'default', value: 'ibar', length: 'ibar'.length}],
			[{ rangeOffset: 12, rangeLength: 2, text: '', range: undefined }, { text: 'r', key: 'default', value: 'r', length: 'r'.length}],
			[{ rangeOffset: 12, rangeLength: 3, text: 'baz', range: undefined }, { text: 'baz', key: 'default', value: 'baz', length: 'baz'.length}],
			[{ rangeOffset: 14, rangeLength: 0, text: ';', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: ' ', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: '=', range: undefined }, { text: 'ba=r', key: 'ba', value: 'r', length: 'ba=r'.length}],
			[{ rangeOffset: 14, rangeLength: 0, text: '\n', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 10, text: '', range: undefined }, null],
		]
		defaultOptionData.forEach(d => it(`parses content change ${JSON.stringify(d[0])} as ${JSON.stringify(d[1])}`, () => {
			const optionParser = new OptionParser({ allowDefault: true, })
			const result = optionParser.parsePartial(existingDefaultOption, d[0])

			if(d[1] === null) {
				expect(result).toBeNull()
			} else {
				expect(result?.content).toHaveProperty('text', d[1].text)
				expect(result?.content).toHaveProperty('key', d[1].key)
				expect(result?.content).toHaveProperty('value', d[1].value)
				expect(result?.content).toHaveProperty('length', d[1].length)
				expect(result?.content).toHaveProperty('start', existingDefaultOption.start)
				expect(result?.content).toHaveProperty('previous', existingDefaultOption.previous)
				expect(result?.content).toHaveProperty('parent', existingDefaultOption.parent)
			}
		}))
	})
})
