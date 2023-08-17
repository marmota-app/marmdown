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

import { NumberedIdGenerator } from "../../../src/IdGenerator"
import { UpdateParser } from "../../../src/UpdateParser"
import { MfMHardLineBreak, MfMHardLineBreakParser } from "../../../src/mfm/inline/MfMHardLineBreak"
import { Parsers } from "../../../src/parser/Parsers"

describe('MfMHardLineBreak', () => {
	function createLineBreakParser() {
		const idGenerator = new NumberedIdGenerator()
		const parsers: Parsers<never> = { idGenerator }
		return { parser: new MfMHardLineBreakParser(parsers), idGenerator }
	}

	describe('parsing the content', () => {
		it('parses two spaces at the end of the content as hard line break', () => {
			const before = 'foo bar'
			const text = `${before}  `
			const { parser } = createLineBreakParser()

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'line-break')
			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '  ')
		})

		it('does not parse hard line break when there is a different character after the spaces', () => {
			const before = 'foo bar'
			const text = `${before}  \t`
			const { parser } = createLineBreakParser()

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).toBeNull()
		})
		it('does not parse hard line break when there is only one space', () => {
			const before = 'foo bar'
			const text = `${before} `
			const { parser } = createLineBreakParser()

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).toBeNull()
		})

		it('parses five spaces at the end of the content as hard line break', () => {
			const before = 'foo bar'
			const text = `${before}     `
			const { parser } = createLineBreakParser()

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'line-break')
			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '     ')
		})

		it('parses single backslash at the end of the line as line break', () => {
			const before = 'foo bar'
			const text = `${before}\\`
			const { parser } = createLineBreakParser()

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'line-break')
			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '\\')
		})
	})
	describe('parsing updates', () => {
		it('returns null when only one space remains', () => {
			const { parser, idGenerator } = createLineBreakParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const before = 'foo bar'
			const text = `${before}  `

			const original = parser.parseLine(null, text, before.length, text.length-before.length) as MfMHardLineBreak
			expect(original).not.toBeNull()
			const updated = updateParser.parse(original, { text: '', rangeOffset: before.length, rangeLength: 1, })

			expect(updated).toBeNull()
		})

		it('returns null when a character is inserted', () => {
			const { parser, idGenerator } = createLineBreakParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const before = 'foo bar'
			const text = `${before}  `

			const original = parser.parseLine(null, text, before.length, text.length-before.length) as MfMHardLineBreak
			expect(original).not.toBeNull()
			const updated = updateParser.parse(original, { text: 'a', rangeOffset: text.length, rangeLength: 0, })

			expect(updated).toBeNull()
		})

		it('still returns a line break when a space is inserted', () => {
			const { parser, idGenerator } = createLineBreakParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const before = 'foo bar'
			const text = `${before}  `

			const original = parser.parseLine(null, text, before.length, text.length-before.length) as MfMHardLineBreak
			expect(original).not.toBeNull()
			const updated = updateParser.parse(original, { text: ' ', rangeOffset: text.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('type', 'line-break')
			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('start', before.length)
			expect(updated?.lines[0]).toHaveProperty('length', 3)
			expect(updated?.lines[0]).toHaveProperty('asText', '   ')
		})

		it('still returns a line break when spaces are replaced with a backslash', () => {
			const { parser, idGenerator } = createLineBreakParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const before = 'foo bar'
			const text = `${before}  `

			const original = parser.parseLine(null, text, before.length, text.length-before.length) as MfMHardLineBreak
			expect(original).not.toBeNull()
			const updated = updateParser.parse(original, { text: '\\', rangeOffset: before.length, rangeLength: 2, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('type', 'line-break')
			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('start', before.length)
			expect(updated?.lines[0]).toHaveProperty('length', 1)
			expect(updated?.lines[0]).toHaveProperty('asText', '\\')
		})
	})
})
