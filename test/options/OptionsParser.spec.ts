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
import { Option, UpdatableOptions } from "$markdown/MarkdownOptions"
import { OptionParser } from "$markdown/options/OptionParser"
import { OptionsParser } from "$markdown/options/OptionsParser"
import { Parsers } from "$markdown/Parsers"

const NO_PARSERS: Parsers<never> = { names: () => [], knownParsers: () => ({}), toplevel: () => [], }
const PARSERS: Parsers<'OptionParser' | 'DefaultOptionParser'> = {
	names: () => [ 'OptionParser', 'DefaultOptionParser', ],
	knownParsers: () => ({ 'OptionParser': new OptionParser(NO_PARSERS), 'DefaultOptionParser': new OptionParser(NO_PARSERS, { allowDefault: true, }), }),
	toplevel: () => [],
}
describe('OptionsParser', () => {
	const optionsParser = new OptionsParser(PARSERS)

	function parse(text: string) {
		return optionsParser.parse(null, text, 0, text.length)
	}

	it('parses empty options when document contains empty options block', () => {
		const [ result, ] = parse('{}')

		expect(result).not.toBeNull()
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', 2)
		expect(result?.contents[0]).toHaveProperty('asText', '{}')
		expect(result?.asMap).toEqual({})
	})
	it('does not parse options when the closing curly bracket is missing', () => {
		const [ result, ] = parse('{')

		expect(result).toBeNull()
	})

	it('parses key-value option at start of the options block', () => {
		const options = '{ foo = bar}'

		const [ result, ] = parse(options)

		expect(result?.asMap).toHaveProperty('foo', 'bar')
		expect(result?.contents[0]).toHaveProperty('length', options.length)
		expect(result?.contents[0]).toHaveProperty('asText', '{ foo = bar}')
	})

	it('parses default option at start of the options block', () => {
		const options = '{ the-value }'

		const [ result, ] = parse(options)

		expect(result?.asMap).toHaveProperty('default', 'the-value')
		expect(result?.contents[0]).toHaveProperty('length', options.length)
		expect(result?.contents[0]).toHaveProperty('asText', '{ the-value }')
	})

	it('parses named option after default option', () => {
		const options = '{ the-value; k1 = v1 }'

		const [ result, ] = parse(options)

		expect(result?.asMap).toHaveProperty('k1', 'v1')
		expect(result?.options.length).toEqual(2)
		expect(result?.contents[0]).toHaveProperty('asText', '{ the-value; k1 = v1 }')
	})
	it('parses named option after named option', () => {
		const options = '{ k1 = v1; k2 = v2 }'

		const [ result, ] = parse(options)

		expect(result?.asMap).toHaveProperty('k2', 'v2')
		expect(result?.options.length).toEqual(2)
	})

	it('stops parsing when there is a default option after a named option', () => {
		const options = '{ k1 = v1; illegal-value }'

		const [ result, ] = parse(options)

		expect(result).toBeNull()
	})

	const textTestData: string[] = ['{}', '{ default }', '{     default; }', '{foo     =     bar; foobar = baz   }']
	textTestData.forEach(options => it(`generates text ${options} after parsing ${options}`, () => {
		const [ result, ] = parse(options)

		expect(result?.contents[0]).toHaveProperty('asText', options)
	}))

	it('prepares for parsing next options line when the previous line ended with "  "', () => {
		const options = '{ default-value  \n k1 = v1 }'
		const firstParseLength = '{ default-value  '.length
		const [ result, ] = optionsParser.parse(null, options, 0, firstParseLength)

		expect(result).not.toBeNull()
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', firstParseLength)
	})
	it('parses next options line when the previous line ended with "  "', () => {
		const options = '{ default-value  \n k1 = v1 }'
		const firstParseLength = '{ default-value  '.length
		const secondParseStart = firstParseLength+1
		const secondParseLength = ' k1 = v1 }'.length
		let [ result, ] = optionsParser.parse(null, options, 0, firstParseLength)
		result = optionsParser.parse(result, options, secondParseStart, secondParseLength)[0]

		expect(result).not.toBeNull()
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', firstParseLength)
		expect(result?.contents[0]).toHaveProperty('asText', '{ default-value  ')

		expect(result?.asMap).toHaveProperty('default', 'default-value')
		expect(result?.asMap).toHaveProperty('k1', 'v1')
		expect(result?.contents[1]).toHaveProperty('length', secondParseLength)
		expect(result?.contents[1]).toHaveProperty('asText', ' k1 = v1 }')
	})
	it('returns null when continued options has error in second line', () => {
		const options = '{ default-value  \n error-value'
		const firstParseLength = '{ default-value  '.length
		const secondParseStart = firstParseLength+1
		const secondParseLength = ' error-value'.length
		let [ result, ] = optionsParser.parse(null, options, 0, firstParseLength)
		result = optionsParser.parse(result, options, secondParseStart, secondParseLength)[0]

		expect(result).toBeNull()
	})
	it('can continue options on a third line', () => {
		const options = '{ default-value  \n k1 = v1;  \n      k2=v2}'
		const firstParseLength = '{ default-value  '.length
		const secondParseStart = firstParseLength+1
		const secondParseLength = ' k1 = v1;  '.length
		const thirdParseStart = secondParseStart+secondParseLength+1
		const thirdParseLength = '      k2=v2}'.length
		let [ result ] = optionsParser.parse(null, options, 0, firstParseLength)
		result = optionsParser.parse(result, options, secondParseStart, secondParseLength)[0]
		result = optionsParser.parse(result, options, thirdParseStart, thirdParseLength)[0]

		expect(result).not.toBeNull()
		expect(result?.contents[0]).toHaveProperty('start', 0)
		expect(result?.contents[0]).toHaveProperty('length', firstParseLength)
		expect(result?.contents[0]).toHaveProperty('asText', '{ default-value  ')

		expect(result?.asMap).toHaveProperty('default', 'default-value')
		expect(result?.asMap).toHaveProperty('k1', 'v1')
		expect(result?.asMap).toHaveProperty('k2', 'v2')
		expect(result?.contents[1]).toHaveProperty('length', secondParseLength)
		expect(result?.contents[1]).toHaveProperty('asText', ' k1 = v1;  ')
		expect(result?.contents[2]).toHaveProperty('length', thirdParseLength)
		expect(result?.contents[2]).toHaveProperty('asText', '      k2=v2}')
	})
	//FIXME
	it.skip('does not allow adding another line after the options block was fully parsed', () => {})
	it.skip('does not allow adding another default option on the second line', () => {})

	describe('partial parsing options', () => {
		it('updates existing option, partially', () => {
			const change: ContentChange = {
				rangeOffset: '{ default;   key'.length, rangeLength: 1, text: 'changed', range: undefined,
			}
			const [ options, ] = parse('{ default;   key1   = value1; }')
			expect(options).not.toBeNull()

			const result = options!.parsedWith!.parsePartial(options!, change) as UpdatableOptions

			expect(result).not.toBeNull()
			expect(result?.asMap).toHaveProperty('keychanged', 'value1')
		})

		it('does not update option when start is -1', () => {
			const change: ContentChange = {
				rangeOffset: 0, rangeLength: 1, text: 'changed', range: undefined,
			}
			const [ options, ] = parse('{ default;   key1   = value1; }')
			options!.contents[0].start = -1
			expect(options).not.toBeNull()

			const result = options!.parsedWith!.parsePartial(options!, change)

			expect(result).toBeNull()
		})


		it('updates existing default option, partially', () => {
			const change: ContentChange = {
				rangeOffset: '{ '.length, rangeLength: 0, text: 'value', range: undefined,
			}
			const [ options, ] = parse('{ default;   key1   = value1; }')
			expect(options).not.toBeNull()

			const result = options!.parsedWith!.parsePartial(options!, change) as UpdatableOptions

			expect(result).not.toBeNull()
			expect(result?.asMap).toHaveProperty('default', 'valuedefault')
		})

		it('updates existing default option, at the end of the option', () => {
			const change: ContentChange = {
				rangeOffset: '{ default'.length, rangeLength: 0, text: 'value', range: undefined,
			}
			const [ options, ] = parse('{ default;   key1   = value1; }')
			expect(options).not.toBeNull()

			const result = options!.parsedWith!.parsePartial(options!, change) as UpdatableOptions

			expect(result).not.toBeNull()
			expect(result?.asMap).toHaveProperty('default', 'defaultvalue')
		})

		it('updates existing options block outside of option', () => {
			const change: ContentChange = {
				rangeOffset: '{'.length, rangeLength: 0, text: 'defaultvalue;', range: undefined,
			}
			const [ options, ] = parse('{    key1   = value1; }')
			expect(options).not.toBeNull()
			expect(options?.asMap).toHaveProperty('key1', 'value1')
			expect(options?.asMap).not.toHaveProperty('default')

			const result = options!.parsedWith!.parsePartial(options!, change) as UpdatableOptions

			expect(result).not.toBeNull()
			expect(options?.asMap).toHaveProperty('key1', 'value1')
			expect(result?.asMap).toHaveProperty('default', 'defaultvalue')
		})

		it('updates existing multi-line options block in first line', () => {
			const options = '{ default-value  \n k1 = v1 }'
			const firstParseLength = '{ default-value  '.length
			const secondParseStart = firstParseLength+1
			const secondParseLength = ' k1 = v1 }'.length
			let [ result, ] = optionsParser.parse(null, options, 0, firstParseLength)
			result = optionsParser.parse(result, options, secondParseStart, secondParseLength)[0]

			result = result?.parsedWith?.parsePartial(result, { rangeOffset: '{ default-value'.length, rangeLength: 0, text: '; newKey=newValue;', range: undefined }) as UpdatableOptions
	
			expect(result).not.toBeNull()
			expect(result?.contents[0]).toHaveProperty('asText', '{ default-value; newKey=newValue;  ')
			expect(result?.contents[1]).toHaveProperty('asText', ' k1 = v1 }')
	
			expect(result?.asMap).toHaveProperty('default', 'default-value')
			expect(result?.asMap).toHaveProperty('k1', 'v1')
			expect(result?.asMap).toHaveProperty('newKey', 'newValue')
		})
		it.skip('updates existing multi-line options block in second line', () => {
			const options = '{ default-value  \n k1 = v1 }'
			const firstParseLength = '{ default-value  '.length
			const secondParseStart = firstParseLength+1
			const secondParseLength = ' k1 = v1 }'.length
			let [ result, ] = optionsParser.parse(null, options, 0, firstParseLength)
			result = optionsParser.parse(result, options, secondParseStart, secondParseLength)[0]

			result = result?.parsedWith?.parsePartial(result, { rangeOffset: '{ default-value  \n '.length, rangeLength: 0, text: 'newKey=newValue; ', range: undefined }) as UpdatableOptions
	
			expect(result).not.toBeNull()
			expect(result?.contents[0]).toHaveProperty('asText', '{ default-value  ')
			expect(result?.contents[1]).toHaveProperty('asText', ' newKey=newValue; k1 = v1 }')
	
			expect(result?.asMap).toHaveProperty('default', 'default-value')
			expect(result?.asMap).toHaveProperty('k1', 'v1')
			expect(result?.asMap).toHaveProperty('newKey', 'newValue')
		})

		const baseOptions = () => (parse('{ defaultValue; foo=bar; }')[0] as UpdatableOptions)
		const existingOptions =() => {
			const options = baseOptions()
			options.contents[0].start = 7
			return options
		}
		const textTestData: [string, ContentChange, string, {[key: string]: string}][] = [
			['{}', { rangeOffset: 1, rangeLength: 0, text: ' content ', range: undefined }, '{ content }', { 'default': 'content', }, ],
			['{ default }', { rangeOffset: '{ de'.length, rangeLength: 3, text: '', range: undefined }, '{ delt }', { 'default': 'delt', }, ],
			['{     default; }', { rangeOffset: 3, rangeLength: 0, text: 'foo =', range: undefined }, '{  foo =   default; }', { 'foo': 'default', }, ],
			['{foo=bar}', { rangeOffset: '{foo='.length, rangeLength: 0, text: 'i', range: undefined }, '{foo=ibar}', { 'foo': 'ibar', }, ],
			['{default;   foo=bar;}', { rangeOffset: '{default; '.length, rangeLength: 0, text: 'a=b;', range: undefined }, '{default; a=b;  foo=bar;}',
				{ 'default': 'default', 'a': 'b', 'foo': 'bar', }, ],
		]
		textTestData.forEach(([options, change, newText, content]) => it(`updates text to ${newText} after parsing change ${JSON.stringify(change)} in ${options}`, () => {
			const [ parsed, ] = parse(options)
	
			const result = parsed?.parsedWith!.parsePartial(parsed, change) as UpdatableOptions

			expect(result?.contents[0]).toHaveProperty('asText', newText)
			Object.keys(content).forEach(k => {
				expect(result.asMap[k]).toEqual(content[k])
			})
		}))

		const indexTestData: [ContentChange, {start: number, length: number}][] = [
			[{ rangeOffset: '{ default'.length+7, rangeLength: 'Value'.length, text: '', range: undefined }, { start: 7, length: existingOptions().contents[0].length-'Value'.length}],
			[{ rangeOffset: '{ defaultValue; foo='.length+7, rangeLength: 0, text: 'i', range: undefined }, { start: 7, length: existingOptions().contents[0].length+'i'.length}],
		]
		indexTestData.forEach(([change, indexData]) => it(`Updates index data to ${JSON.stringify(indexData)} after change ${JSON.stringify(change)}`, () => {
			const result = existingOptions()!.parsedWith!.parsePartial(existingOptions(), change)

			expect(result?.contents[0]).toHaveProperty('start', indexData.start)
			expect(result?.contents[0]).toHaveProperty('length', indexData.length)
		}))

		const outOfBoundsTestdata: ContentChange[] = [
			{ rangeOffset: 6, rangeLength: 'Value'.length, text: '', range: undefined },
			{ rangeOffset: existingOptions().contents[0].length+7+5, rangeLength: 'Value'.length, text: '', range: undefined },
			{ rangeOffset: existingOptions().contents[0].length+7-5, rangeLength: 'long text'.length, text: '', range: undefined },
		]
		outOfBoundsTestdata.forEach(change => it(`Does not parse out-of-bounds change ${JSON.stringify(change)}`, () => {
			const result = existingOptions()!.parsedWith!.parsePartial(existingOptions(), change)

			expect(result).toBeNull()
		}))
	})
})
