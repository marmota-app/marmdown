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

import { createParagraphParser } from "./createParagraphParser"

describe('MfMParagraph parser', () => {
	describe('parsing the content', () => {
		it('parses single-line simple text content', () => {
			const { paragraphParser } = createParagraphParser()

			const text = 'hello world'
			const result = paragraphParser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'content-line')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0].content[0]).toHaveProperty('text', text)
		})

		it('parses a second text content line', () => {
			const { paragraphParser } = createParagraphParser()

			const line1 = 'hello world'
			const line2 = 'hello marmota'
			const text = `${line1}\n${line2}`
			const first = paragraphParser.parseLine(null, text, 0, line1.length)
			const result = paragraphParser.parseLine(first, text, `${line1}\n`.length, line2.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('type', 'content-line')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0].content[0]).toHaveProperty('text', line1)
			expect(result?.content[1]).toHaveProperty('type', 'content-line')
			expect(result?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[1].content[0]).toHaveProperty('text', line2)

			expect(result?.lines).toHaveLength(2)
			expect(result?.lines[0]).toHaveProperty('asText', line1)
			expect(result?.lines[1]).toHaveProperty('asText', line2)
		});

		[ '', '    ', '\t', '  \t    \t ' ].forEach((empty: string) => it(`ends paragraph at an empty line "${empty.replaceAll('\t', '\\t')}"`, () => {
			const { paragraphParser } = createParagraphParser()
			const line1 = 'hello world'
			const text = `${line1}\n${empty}\n---ignore me---`

			const first = paragraphParser.parseLine(null, text, 0, line1.length)
			const result = paragraphParser.parseLine(first, text, `${line1}\n`.length, empty.length)

			expect(result).toBeNull()
			expect(first).toHaveProperty('isFullyParsed', true)
		}))
		it('ends paragraph on block content (e.g. heading)', () => {
			const { paragraphParser } = createParagraphParser()
			const line1 = 'hello world'
			const heading = '# I am a heading'
			const text = `${line1}\n${heading}\n---ignore me---`

			const first = paragraphParser.parseLine(null, text, 0, line1.length)
			const result = paragraphParser.parseLine(first, text, `${line1}\n`.length, heading.length)

			expect(result).toBeNull()
			expect(first).toHaveProperty('isFullyParsed', true)
		})
	})
	describe.skip('the content of paragraphs', () => {
		it.skip('parses text with bold content', () => {})
		it.skip('parses text with bold, italic and strike-through content', () => {})
	})
	describe.skip('parsing updates', () => {
		//TODO implement me
	})
})