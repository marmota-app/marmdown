/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

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

import { UpdateParser } from "../../../src/UpdateParser"
import { MfMCodeSpan } from "../../../src/mfm/inline/MfMCodeSpan"
import { createCodeSpanParser } from "./createCodeSpanParser"

describe('MfMCodeSpan', () => {
	describe('parsing the content', () => {
		it('parses simple code span', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = 'text before `code span`'

			const result = codeSpanParser.parseInline(text, 'text before '.length, text.length - 'text before '.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', 'code span')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`code span`')
		})
		it('does not parse code span that does not begin at the start of the input', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = 'text before `code span`'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toBeNull()
		})
		it('does not parse unclosed code span', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '`not code span'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'text')
			expect(result).toHaveProperty('text', '`')
		})
		it('parses code span only until the closing delimiter', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '`code span` with text after'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', 'code span')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`code span`')
		})

		it('does not escape delimiter with backslash', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '`code span\\` with text after'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('unescapedText', 'code span\\')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`code span\\`')
		});

		[ '``', '```', '````', ].forEach(delimiter => {
			it(`finds code span delimited by ${delimiter}`, () => {
				const { codeSpanParser } = createCodeSpanParser()
				const text = `${delimiter}code ${delimiter}\` span${delimiter} with text after`
	
				const result = codeSpanParser.parseInline(text, 0, text.length)
	
				expect(result).toHaveProperty('type', 'code-span')
				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('text', `code ${delimiter}\` span`)
	
				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', `${delimiter}code ${delimiter}\` span${delimiter}`)
			})
			it(`does not find code span when the closing delimiter is longer (${delimiter})`, () => {
				const { codeSpanParser } = createCodeSpanParser()
				const text = `${delimiter}not code span${delimiter}\``
	
				const result = codeSpanParser.parseInline(text, 0, text.length)
	
				expect(result).toHaveProperty('type', 'text')
				expect(result).toHaveProperty('text', delimiter)
			})
		})

		it('strips single space at the beginning and end', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '`  code span  ` with text after'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', ' code span ')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`  code span  `')
		})

		it('does not strip space at the beginning when there is no space at the end', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '` code span` with text after'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', ' code span')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '` code span`')
		})
		it('does not strip space at the end when there is no space at the beginning', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '`code span ` with text after'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', 'code span ')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`code span `')
		})
		it('does not strip spaces when the text contains ONLY spaces', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = '`      ` with text after'

			const result = codeSpanParser.parseInline(text, 0, text.length)

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', '      ')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`      `')
		})
	})

	describe('parsing options', () => {
		it('can parse options on code spans', () => {
			const { codeSpanParser } = createCodeSpanParser()
			const text = 'text before `{ default value; key2 = value2 } code span`'

			const result = codeSpanParser.parseInline(text, 'text before '.length, text.length - 'text before '.length) as MfMCodeSpan

			expect(result).toHaveProperty('type', 'code-span')
			expect(result?.options.get('default')).toEqual('default value')
			expect(result?.options.get('key2')).toEqual('value2')

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('text', 'code span')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '`{ default value; key2 = value2 } code span`')

		})
	})
	describe('parsing updates', () => {
		it('updates the content of the code span', () => {
			const { codeSpanParser, idGenerator } = createCodeSpanParser()
			const updateParser = new UpdateParser(idGenerator)

			const text = 'text before `{ default value; key2 = value2 } code span`'
			const original = codeSpanParser.parseInline(text, 'text before '.length, text.length - 'text before '.length) as MfMCodeSpan
			const updated = updateParser.parse(original, { text: 'updated ', rangeOffset: 'text before `{ default value; key2 = value2 } '.length, rangeLength: 0})

			expect(updated).toHaveProperty('type', 'code-span')
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('text', 'updated code span')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('asText', '`{ default value; key2 = value2 } updated code span`')
		})
		it('updates the options of the code span', () => {
			const { codeSpanParser, idGenerator } = createCodeSpanParser()
			const updateParser = new UpdateParser(idGenerator)

			const text = 'text before `{ default value; key2 = value2 } code span`'
			const original = codeSpanParser.parseInline(text, 'text before '.length, text.length - 'text before '.length) as MfMCodeSpan
			const intermediate = updateParser.parse(original, { text: '3', rangeOffset: 'text before `{ default value; key'.length, rangeLength: 1}) as MfMCodeSpan
			const updated = updateParser.parse(intermediate, { text: '3', rangeOffset: 'text before `{ default value; key3 = value'.length, rangeLength: 1}) as MfMCodeSpan

			expect(updated).toHaveProperty('type', 'code-span')
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('text', 'code span')

			expect(updated?.options.get('default')).toEqual('default value')
			expect(updated?.options.get('key2')).toBeUndefined()
			expect(updated?.options.get('key3')).toEqual('value3')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('asText', '`{ default value; key3 = value3 } code span`')
		})
		it('stops stripping spaces when removing one of the enclosing spaces', () => {
			const { codeSpanParser, idGenerator } = createCodeSpanParser()
			const updateParser = new UpdateParser(idGenerator)

			const text = '` code span ` with text after'

			const original = codeSpanParser.parseInline(text, 0, text.length) as MfMCodeSpan
			const updated = updateParser.parse(original, { text: '', rangeOffset: '`'.length, rangeLength: 1})

			expect(updated).toHaveProperty('type', 'code-span')
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('text', 'code span ')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('asText', '`code span `')
		})
		it('cannot parse update that might change the stripping of spaces', () => {
			const { codeSpanParser, idGenerator } = createCodeSpanParser()
			const updateParser = new UpdateParser(idGenerator)

			const text = '` code span` with text after'

			const original = codeSpanParser.parseInline(text, 0, text.length) as MfMCodeSpan
			const updated = updateParser.parse(original, { text: ' ', rangeOffset: '` code span'.length, rangeLength: 0})

			expect(updated).toBeNull()
		})
	})
})
