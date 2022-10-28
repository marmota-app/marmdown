/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
import { ContentChange } from "$markdown/ContentChange"
import { UpdatableOption } from "$markdown/MarkdownOptions"
import { OptionParser } from "$markdown/options/OptionParser"
import { Parsers } from "$markdown/Parsers"

const NO_PARSERS: Parsers<never> = { names: () => [], knownParsers: () => ({}), toplevel: () => [], }
describe('OptionParser', () => {
	const optionParser = new OptionParser(NO_PARSERS)

	it('returns option for correctly parsed option', () => {
		const option = 'foo = bar'

		const result = optionParser.parse(null, option, 0, option.length)

		expect(result).toHaveProperty('key', 'foo')
		expect(result).toHaveProperty('value', 'bar')
		expect(result?.contents).toHaveLength(1)
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', option.length)
		expect(result?.contents[0]).toHaveProperty('asText', 'foo = bar')
	})

	it('returns null if it gets supplied a second line (indicated by there being a previous result)', () => {
		const option = 'foo = bar'

		const previous = optionParser.parse(null, option, 0, option.length)
		const result = optionParser.parse(previous, option, 0, option.length)

		expect(result).toBeNull()
	})

	it('returns null when option could not be parsed', () => {
		const option = ''

		const result = optionParser.parse(null, option, 0, option.length)

		expect(result).toBeNull()
	})

	it('parses a different named option in the middle of the text', () => {
		const option = 'something. bar = foo'

		const result = optionParser.parse(null, option, 11, option.length-11)

		expect(result).toHaveProperty('key', 'bar')
		expect(result).toHaveProperty('value', 'foo')
		expect(result?.contents[0]).toHaveProperty('start', 11)
		expect(result?.contents[0]).toHaveProperty('length', option.length-11)
		expect(result?.contents[0]).toHaveProperty('asText', 'bar = foo')
	})

	it('parses default option when allowed', () => {
		const option = 'bar'
		const optionParser = new OptionParser(NO_PARSERS, { allowDefault: true, })

		const result = optionParser.parse(null, option, 0, option.length)

		expect(result).toHaveProperty('key', 'default')
		expect(result).toHaveProperty('value', 'bar')
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', option.length)
		expect(result?.contents[0]).toHaveProperty('asText', 'bar')
	})

	it('does not parse default option when not allowed', () => {
		const option = 'bar'
		const optionParser = new OptionParser(NO_PARSERS, { allowDefault: false, })

		const result = optionParser.parse(null, option, 0, option.length)

		expect(result).toBeNull()
	})

	it('parses an option value that contains spaces', () => {
		const option = 'foo = some longer\ttext   \t'

		const result = optionParser.parse(null, option, 0, option.length)

		expect(result).toHaveProperty('key', 'foo')
		expect(result).toHaveProperty('value', 'some longer\ttext')
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', option.length)
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
			const optionParser = new OptionParser(NO_PARSERS, { allowDefault: true, })
	
			const result = optionParser.parse(null, option, 0, option.length)
	
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'bar')
			expect(result?.contents[0]).toHaveProperty('length', 3)
			expect(result?.contents[0]).toHaveProperty('start', 0)
		}))

		it('parses named option ended by "="', () => {
			const option = 'foo=bar'
	
			const result = optionParser.parse(null, option, 0, option.length)
	
			expect(result).toHaveProperty('key', 'foo')
			expect(result).toHaveProperty('value', 'bar')
			expect(result?.contents[0]).toHaveProperty('start', 0)
			expect(result?.contents[0]).toHaveProperty('length', option.length)
		})	
	})

	describe('partially parsing changes', () => {
		interface ExpectedResult { text: string, key: string, value: string, length: number, }

		const existingOption = optionParser.parse(null, '123456789012foo = bar', 12, 'foo = bar'.length)
		existingOption!.contents[0].parent = { contained: [], parent: undefined, start: 0, length: 6, asText: 'foobar'}
		const data: [ ContentChange, ExpectedResult | null, ][] = [
			[{ rangeOffset: 10, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 50, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 12, rangeLength: 0, text: 'i', range: undefined }, { text: 'ifoo = bar', key: 'ifoo', value: 'bar', length: 'ifoo = bar'.length}],
			[{ rangeOffset: 18, rangeLength: 0, text: 'i', range: undefined }, { text: 'foo = ibar', key: 'foo', value: 'ibar', length: 'foo = ibar'.length}],
			[{ rangeOffset: 21, rangeLength: 0, text: 'i', range: undefined }, { text: 'foo = bari', key: 'foo', value: 'bari', length: 'foo = bari'.length}],
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
			const result = optionParser.parsePartial(existingOption!, d[0])

			if(d[1] === null) {
				expect(result).toBeNull()
			} else {
				expect(result).toHaveProperty('key', d[1].key)
				expect(result).toHaveProperty('value', d[1].value)
				expect(result?.contents[0]).toHaveProperty('asText', d[1].text)
				expect(result?.contents[0]).toHaveProperty('length', d[1].length)
				expect(result?.contents[0]).toHaveProperty('start', existingOption?.contents[0].start)
				expect(result?.contents[0]).toHaveProperty('parent', existingOption?.contents[0].parent)
			}
		}))

		const defaultOptionParser = new OptionParser(NO_PARSERS, { allowDefault: true, })
		const existingDefaultOption = defaultOptionParser.parse(null, '123456789012bar', 12, 'bar'.length)
		existingDefaultOption!.contents[0].parent = { contained: [], parent: undefined, start: 0, length: 6, asText: 'foobar'}
		const defaultOptionData: [ ContentChange, ExpectedResult | null, ][] = [
			[{ rangeOffset: 10, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 50, rangeLength: 0, text: 'ignore', range: undefined }, null],
			[{ rangeOffset: 12, rangeLength: 0, text: 'i', range: undefined }, { text: 'ibar', key: 'default', value: 'ibar', length: 'ibar'.length}],
			[{ rangeOffset: 15, rangeLength: 0, text: 'i', range: undefined }, { text: 'bari', key: 'default', value: 'bari', length: 'bari'.length}],
			[{ rangeOffset: 12, rangeLength: 2, text: '', range: undefined }, { text: 'r', key: 'default', value: 'r', length: 'r'.length}],
			[{ rangeOffset: 12, rangeLength: 3, text: 'baz', range: undefined }, { text: 'baz', key: 'default', value: 'baz', length: 'baz'.length}],
			[{ rangeOffset: 14, rangeLength: 0, text: ';', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: ' ', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 0, text: '=', range: undefined }, { text: 'ba=r', key: 'ba', value: 'r', length: 'ba=r'.length}],
			[{ rangeOffset: 14, rangeLength: 0, text: '\n', range: undefined }, null],
			[{ rangeOffset: 14, rangeLength: 10, text: '', range: undefined }, null],
		]
		defaultOptionData.forEach(d => it(`parses content change ${JSON.stringify(d[0])} as ${JSON.stringify(d[1])}`, () => {
			const optionParser = new OptionParser(NO_PARSERS, { allowDefault: true, })
			const result = optionParser.parsePartial(existingDefaultOption!, d[0])

			if(d[1] === null) {
				expect(result).toBeNull()
			} else {
				expect(result).toHaveProperty('key', d[1].key)
				expect(result).toHaveProperty('value', d[1].value)
				expect(result?.contents[0]).toHaveProperty('asText', d[1].text)
				expect(result?.contents[0]).toHaveProperty('length', d[1].length)
				expect(result?.contents[0]).toHaveProperty('start', existingDefaultOption?.contents[0].start)
				expect(result?.contents[0]).toHaveProperty('parent', existingDefaultOption?.contents[0].parent)
			}
		}))
	})
})
