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

import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { UpdateParser } from "$markdown/UpdateParser"
import { EmptyElement, EmptyElementParser } from "$parser/EmptyElementParser"
import { createEmptyElementParser } from "./createEmptyElementParser"

describe('EmptyElement parser', () => {
	describe('parsing the content', () => {
		it('parses a completely empty line as an empty element', () => {
			const parser = createEmptyElementParser()

			const result = parser.parseLine(null, 'hello\n\nworld', 'hello\n'.length, ''.length)

			expect(result).not.toBeNull()
			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '')
		})
		it('does not parse empty line when the line is not empty', () => {
			const parser = createEmptyElementParser()

			const result = parser.parseLine(null, 'hello\nwonderful\nworld', 'hello\n'.length, 'wonderful'.length)

			expect(result).toBeNull()
		})
		it('returns whitespace content when the line is whitespace only', () => {
			const parser = createEmptyElementParser()

			const result = parser.parseLine(null, 'hello\n  \t \t\t\nworld', 'hello\n'.length, '  \t \t\t'.length)

			expect(result).not.toBeNull()
			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '  \t \t\t')
		})
		it('parses a second empty line', () => {
			const parser = createEmptyElementParser()
			const text = 'hello\n  \t \t\t\n    \nworld'

			const intermediate = parser.parseLine(null, text, 'hello\n'.length, '  \t \t\t'.length)
			const result = parser.parseLine(intermediate, text, 'hello\n  \t \t\t\n'.length, '    '.length)

			expect(result).not.toBeNull()
			expect(result?.lines).toHaveLength(2)
			expect(result?.lines[0]).toHaveProperty('asText', '  \t \t\t')
			expect(result?.lines[1]).toHaveProperty('asText', '    ')
		})
		it('sets fully parsed when it encounters a non-empty line', () => {
			const parser = createEmptyElementParser()
			const text = 'hello\n  \t \t\t\nbeautiful\n    \nworld'

			const intermediate = parser.parseLine(null, text, 'hello\n'.length, '  \t \t\t'.length)
			const result = parser.parseLine(intermediate, text, 'hello\n  \t \t\t\n'.length, 'beautiful'.length)

			expect(result).toBeNull()
			expect(intermediate).toHaveProperty('isFullyParsed', true)
		})
	})

	describe('parsing updates', () => {
		it('updates a line that contains only whitespace, adding a tab', () => {
			const parser = createEmptyElementParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = 'hello\n  \t \t\t\n    \nworld'

			const intermediate = parser.parseLine(null, text, 'hello\n'.length, '  \t \t\t'.length)
			const original = parser.parseLine(intermediate, text, 'hello\n  \t \t\t\n'.length, '    '.length) as EmptyElement

			const updated = updateParser.parse(original, { text: '\t', rangeOffset: 'hello\n  \t \t\t\n  '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('asText', '  \t \t\t')
			expect(updated?.lines[1]).toHaveProperty('asText', '  \t  ')
		})

		it('updates a line that contains only whitespace, removing all content', () => {
			const parser = createEmptyElementParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = 'hello\n  \t \t\t\n    \nworld'

			const intermediate = parser.parseLine(null, text, 'hello\n'.length, '  \t \t\t'.length)
			const original = parser.parseLine(intermediate, text, 'hello\n  \t \t\t\n'.length, '    '.length) as EmptyElement

			const updated = updateParser.parse(original, { text: '', rangeOffset: 'hello\n'.length, rangeLength: '  \t \t\t'.length, })

			expect(updated).not.toBeNull()
			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('asText', '')
			expect(updated?.lines[1]).toHaveProperty('asText', '    ')
		})

		it('does not update when a line is removed completely', () => {
			const parser = createEmptyElementParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = 'hello\n  \t \t\t\n    \nworld'

			const intermediate = parser.parseLine(null, text, 'hello\n'.length, '  \t \t\t'.length)
			const original = parser.parseLine(intermediate, text, 'hello\n  \t \t\t\n'.length, '    '.length) as EmptyElement

			const updated = updateParser.parse(original, { text: '', rangeOffset: 'hello\n'.length, rangeLength: '  \t \t\t\n'.length, })

			expect(updated).toBeNull()
		})

		it('does not update when text is added ', () => {
			const parser = createEmptyElementParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = 'hello\n  \t \t\t\n    \nworld'

			const intermediate = parser.parseLine(null, text, 'hello\n'.length, '  \t \t\t'.length)
			const original = parser.parseLine(intermediate, text, 'hello\n  \t \t\t\n'.length, '    '.length) as EmptyElement

			const updated = updateParser.parse(original, { text: 'don\'t update', rangeOffset: 'hello\n  '.length, rangeLength: 0, })

			expect(updated).toBeNull()
		})
	})
})
