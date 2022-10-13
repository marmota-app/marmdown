import { Paragraph, TextContent } from "$markdown/MarkdownDocument"
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
import { MfMParsers } from "$markdown/MfMParsers"
import { OptionsParser } from "$markdown/options/OptionsParser"
import { TextParser } from "$markdown/parser/TextParser"
import { parsers, Parsers } from "$markdown/Parsers"
import { BlockParser } from "$markdown/toplevel/BlockParser"
import { HeadingParser } from "$markdown/toplevel/HeadingParser"
import { ParagraphParser } from "$markdown/toplevel/ParagraphParser"

describe('BlockParser', () => {
	const testData: [string, 'Blockquote'|'Aside'][] = [
		[ '>', 'Blockquote'],
		[ '^', 'Aside'],
	]
	testData.forEach(([delimiter, type]) => describe(`${type}`, () => {
		const parser = new BlockParser(delimiter, type, new MfMParsers())
		function parse(md: string, start: number = 0) { return parser.parse(md, start, md.length-start)}

		it(`parses line starting with ${delimiter} as ${type}`, () => {
			const result = parse(`${delimiter}`)
			expect(result).toHaveProperty('type', type)
		})
		it(`parses text after ${delimiter}`, () => {
			const result = parse(`${delimiter}the quick brown fox`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
		})
		it(`parses text after ${delimiter}, skipping one space`, () => {
			const result = parse(`${delimiter} the quick brown fox`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
		})
		it(`parses text after ${delimiter}, skipping at most one space`, () => {
			const result = parse(`${delimiter}  the quick brown fox`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content[0]).toHaveProperty('content', ' the quick brown fox')
		})

		it(`does not parse line starting with a`, () => {
			const result = parse(`asdf`)
			expect(result).toBeNull()
		})

		it('parses heading inside block with correct position data', () => {
			const result = parse(`before\n${delimiter} # Heading`, 'before\n'.length)

			expect(result).toHaveProperty('start', 'before\n'.length)
			expect(result).toHaveProperty('length', `${delimiter} # Heading`.length)
			expect(result).toHaveProperty('type', type)
		})

		it('parses heading inside block with correct content', () => {
			const result = parse(`before\n${delimiter} # The Heading`, 'before\n'.length)

			expect(result).toHaveProperty('type', type)
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Heading')
			expect(result?.content[0]).toHaveProperty('text', 'The Heading')
		})

		it('parses options at the beginning of the block', () => {
			const result = parse(`${delimiter}{ foo=bar }`)
			expect(result?.options).toHaveProperty('foo', 'bar')
		})

		it('does not allow more than three spaces before a block delimiter', () => {
			const result = parse(`    ${delimiter}`)
			expect(result).toBeNull()
		})

		it('parses a multi-line paragraph inside the block', () => {
			const result = parse(`${delimiter} the quick brown fox\n${delimiter}jumps over the lazy dog\n${delimiter}   but why?`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(5)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
			expect(paragraph.content[4]).toHaveProperty('content', '  but why?')
		})
		it('parses a multi-line paragraph inside the block', () => {
			const result = parse(`${delimiter} the quick brown fox\n${delimiter}jumps over the lazy dog\nnot part of aside`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(4)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
		})
	}))
})
