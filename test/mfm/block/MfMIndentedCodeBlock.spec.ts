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
import { MfMIndentedCodeBlock, MfMIndentedCodeBlockParser } from "../../../src/mfm/block/MfMIndentedCodeBlock"
import { MfMTextParser } from "../../../src/mfm/inline/MfMText"

function createIndentedCodeBlockParser() {
	const idGenerator = new NumberedIdGenerator()
	const MfMText = new MfMTextParser({ idGenerator })
	const parser = new MfMIndentedCodeBlockParser({ MfMText, idGenerator })
	return { parser, idGenerator }
}

describe('MfMIndentedCodeBlock', () => {
	describe('parsing the content', () => {
		it('parses a single content line, indented by four spaces', () => {
			const {parser} = createIndentedCodeBlockParser()
			const before = 'content before\n'
			const text = `${before}    indented code`

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).toHaveProperty('type', 'indented-code-block')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0]).toHaveProperty('text', 'indented code')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '    indented code')
		})
		it('does not parse when the line is indented less than four spaces', () => {
			const {parser} = createIndentedCodeBlockParser()
			const before = 'content before\n'
			const text = `${before}   indented code`

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).toBeNull()
		})
		it('cannot start an indented code block with an empty line', () => {
			const {parser} = createIndentedCodeBlockParser()
			const before = 'content before\n'
			const text = `${before}     \t  `

			const result = parser.parseLine(null, text, before.length, text.length-before.length)

			expect(result).toBeNull()
		})
		it('adds an indented line to a code block', () => {
			const {parser} = createIndentedCodeBlockParser()
			const before = 'content before'
			const line1 = '    line 1'
			const line2 = '    line 2'
			const text = `${before}\n${line1}\n${line2}`

			const intermediate = parser.parseLine(null, text, `${before}\n`.length, line1.length)
			const result = parser.parseLine(intermediate, text, `${before}\n${line1}\n`.length, line2.length)

			expect(result).toHaveProperty('type', 'indented-code-block')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('type', 'text')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')

			expect(result?.lines).toHaveLength(2)
			expect(result?.lines[0]).toHaveProperty('asText', line1)
			expect(result?.lines[1]).toHaveProperty('asText', line2)
		})
		it('does not end the code block on an empty line', () => {
			const {parser} = createIndentedCodeBlockParser()
			const before = 'content before'
			const line1 = '    line 1'
			const line2 = '\t   \t    '
			const line3 = '    line 3'
			const text = `${before}\n${line1}\n${line2}\n${line3}`

			const intermediate1 = parser.parseLine(null, text, `${before}\n`.length, line1.length)
			const intermediate2 = parser.parseLine(intermediate1, text, `${before}\n${line1}\n`.length, line2.length)
			const result = parser.parseLine(intermediate2, text, `${before}\n${line1}\n${line2}\n`.length, line3.length)

			expect(result).toHaveProperty('type', 'indented-code-block')
			expect(result?.content).toHaveLength(3)
			expect(result?.content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('type', 'text')
			expect(result?.content[1]).toHaveProperty('text', '')
			expect(result?.content[2]).toHaveProperty('type', 'text')
			expect(result?.content[2]).toHaveProperty('text', 'line 3')

			expect(result?.lines).toHaveLength(3)
			expect(result?.lines[0]).toHaveProperty('asText', line1)
			expect(result?.lines[1]).toHaveProperty('asText', line2)
			expect(result?.lines[2]).toHaveProperty('asText', line3)
		})
		it('ends the code block on a blank line following the code block', () => {
			const {parser} = createIndentedCodeBlockParser()
			const before = 'content before'
			const line1 = '    line 1'
			const line2 = '\t   \t    '
			const line3 = '   a paragraph'
			const text = `${before}\n${line1}\n${line2}\n${line3}`

			const intermediate1 = parser.parseLine(null, text, `${before}\n`.length, line1.length)
			const result = parser.parseLine(intermediate1, text, `${before}\n${line1}\n`.length, line2.length)

			expect(result).toBeNull()
		})
	})
	describe('parsing updates', () => {
		it('can update the content of a code block line', () => {
			const { parser, idGenerator } = createIndentedCodeBlockParser()
			const updateParser = new UpdateParser(idGenerator)
			const before = 'content before'
			const line1 = '    line 1'
			const line2 = '\t   \t    '
			const line3 = '    line 3'
			const text = `${before}\n${line1}\n${line2}\n${line3}`

			const intermediate1 = parser.parseLine(null, text, `${before}\n`.length, line1.length)
			const intermediate2 = parser.parseLine(intermediate1, text, `${before}\n${line1}\n`.length, line2.length)
			const original = parser.parseLine(intermediate2, text, `${before}\n${line1}\n${line2}\n`.length, line3.length) as MfMIndentedCodeBlock

			const result = updateParser.parse(original, { text: ' (updated)', rangeOffset: `${before}\n${line1}`.length, rangeLength: 0})

			expect(result).toHaveProperty('type', 'indented-code-block')
			expect(result?.content).toHaveLength(3)
			expect(result?.content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0]).toHaveProperty('text', 'line 1 (updated)')
			expect(result?.content[1]).toHaveProperty('type', 'text')
			expect(result?.content[1]).toHaveProperty('text', '')
			expect(result?.content[2]).toHaveProperty('type', 'text')
			expect(result?.content[2]).toHaveProperty('text', 'line 3')

			expect(result?.lines).toHaveLength(3)
			expect(result?.lines[0]).toHaveProperty('asText', line1+' (updated)')
			expect(result?.lines[1]).toHaveProperty('asText', line2)
			expect(result?.lines[2]).toHaveProperty('asText', line3)

		})
		it('does not update the code block when the indentation changes', () => {
			const { parser, idGenerator } = createIndentedCodeBlockParser()
			const updateParser = new UpdateParser(idGenerator)
			const before = 'content before'
			const line1 = '    line 1'
			const line2 = '\t   \t    '
			const line3 = '    line 3'
			const text = `${before}\n${line1}\n${line2}\n${line3}`

			const intermediate1 = parser.parseLine(null, text, `${before}\n`.length, line1.length)
			const intermediate2 = parser.parseLine(intermediate1, text, `${before}\n${line1}\n`.length, line2.length)
			const original = parser.parseLine(intermediate2, text, `${before}\n${line1}\n${line2}\n`.length, line3.length) as MfMIndentedCodeBlock

			const result = updateParser.parse(original, { text: '  ', rangeOffset: `${before}\n `.length, rangeLength: 0})

			expect(result).toBeNull()
		})
	})
})
