import { Block, Heading, Paragraph, TextContent } from "$markdown/MarkdownDocument"
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
import { BlockParser, UpdatableBlock } from "$markdown/toplevel/BlockParser"
import { HeadingParser } from "$markdown/toplevel/HeadingParser"
import { ParagraphParser } from "$markdown/toplevel/ParagraphParser"

//TODO The whole block parser was a work-in-progress
describe('BlockParser', () => {
	const testData: [string, 'Blockquote'|'Aside'][] = [
		[ '>', 'Blockquote'],
		[ '^', 'Aside'],
	]
	testData.forEach(([delimiter, type]) => describe(`${type}`, () => {
		const parser = new BlockParser(delimiter, type, new MfMParsers())
		function parse(md: string, start: number = 0) { return parser.parse(md, start, md.length-start)}

		it.skip(`parses line starting with ${delimiter} as ${type}`, () => {
			const result = parse(`${delimiter}`)
			expect(result).toHaveProperty('type', type)
		})
		it.skip(`parses text after ${delimiter}`, () => {
			const result = parse(`${delimiter}the quick brown fox`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
		})
		it.skip(`parses text after ${delimiter}, skipping one space`, () => {
			const result = parse(`${delimiter} the quick brown fox`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
		})
		it.skip(`parses text after ${delimiter}, skipping at most one space`, () => {
			const result = parse(`${delimiter}  the quick brown fox`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content[0]).toHaveProperty('content', ' the quick brown fox')
		})

		it.skip(`does not parse line starting with a`, () => {
			const result = parse(`asdf`)
			expect(result).toBeNull()
		})

		it.skip('parses heading inside block with correct position data', () => {
			const result = parse(`before\n${delimiter} # Heading`, 'before\n'.length)

			expect(result).toHaveProperty('start', 'before\n'.length)
			expect(result).toHaveProperty('length', `${delimiter} # Heading`.length)
			expect(result).toHaveProperty('type', type)
		})

		it.skip('parses heading inside block with correct content', () => {
			const result = parse(`before\n${delimiter} # The Heading`, 'before\n'.length)

			expect(result).toHaveProperty('type', type)
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Heading')
			expect(result?.content[0]).toHaveProperty('text', 'The Heading')
		})

		it.skip('parses options at the beginning of the block', () => {
			const result = parse(`${delimiter}{ foo=bar }`)
			expect(result?.options).toHaveProperty('foo', 'bar')
		})

		it.skip('does not allow more than three spaces before a block delimiter', () => {
			const result = parse(`    ${delimiter}`)
			expect(result).toBeNull()
		})

		it.skip('parses a multi-line paragraph inside the block', () => {
			const result = parse(`${delimiter} the quick brown fox\n${delimiter}jumps over the lazy dog\n${delimiter}   but why?`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(5)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
			expect(paragraph.content[4]).toHaveProperty('content', '  but why?')
		})
		it.skip('parses a multi-line paragraph inside the block', () => {
			const result = parse(`${delimiter} the quick brown fox\n${delimiter}jumps over the lazy dog\nnot part of aside`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(4)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
		})

		it.skip('adds a paragraph after a headline inside the block', () => {
			const result = parse(`${delimiter} # the headline\n${delimiter}\n${delimiter} the paragraph`)

			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('type', 'Heading')
			expect(result?.content[0]).toHaveProperty('text', 'the headline')

			expect(result?.content[1]).toHaveProperty('type', 'Paragraph')
			const paragraph = result?.content[1] as Paragraph
			expect(paragraph.content).toHaveLength(1)
			expect(paragraph.content[0]).toHaveProperty('content', 'the paragraph')
		})

		it.skip('adds a paragraph after a paragraph inside the block', () => {
			const result = parse(`${delimiter} the first\n${delimiter} paragraph\n${delimiter}\n${delimiter} the second\n${delimiter}paragraph`)

			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')
			const paragraph1 = result?.content[0] as Paragraph
			expect(paragraph1.content).toHaveLength(4)
			expect(paragraph1.content[0]).toHaveProperty('content', 'the first')
			expect(paragraph1.content[2]).toHaveProperty('content', 'paragraph')

			expect(result?.content[1]).toHaveProperty('type', 'Paragraph')
			const paragraph2 = result?.content[1] as Paragraph
			expect(paragraph2.content).toHaveLength(3)
			expect(paragraph2.content[0]).toHaveProperty('content', 'the second')
			expect(paragraph2.content[2]).toHaveProperty('content', 'paragraph')
		})

		it.skip('adds a paragraph after a paragraph and headline inside the block', () => {
			const result = parse(`${delimiter} the first\n${delimiter} paragraph\n${delimiter} # headline\n${delimiter} the second\n${delimiter}paragraph`)

			expect(result?.content).toHaveLength(3)
			expect(result?.content[0]).toHaveProperty('type', 'Paragraph')
			const paragraph1 = result?.content[0] as Paragraph
			expect(paragraph1.content).toHaveLength(4)
			expect(paragraph1.content[0]).toHaveProperty('content', 'the first')
			expect(paragraph1.content[2]).toHaveProperty('content', 'paragraph')

			expect(result?.content[1]).toHaveProperty('type', 'Heading')
			expect(result?.content[1]).toHaveProperty('text', 'headline')

			expect(result?.content[2]).toHaveProperty('type', 'Paragraph')
			const paragraph2 = result?.content[2] as Paragraph
			expect(paragraph2.content).toHaveLength(3)
			expect(paragraph2.content[0]).toHaveProperty('content', 'the second')
			expect(paragraph2.content[2]).toHaveProperty('content', 'paragraph')
		})
	}))

	describe('nesting blocks and toplevel data', () => {
		const nestedBlockTestData: [string, string[]][] = [
			['> # heading\n> > block\n> paragraph', [ 'Heading', 'Blockquote', 'Paragraph']],
			['> > block\n> > block', [ 'Blockquote']],
			['> > block\n>\n> > block', [ 'Blockquote', 'Blockquote']],
			['> > block\n>\n> ^ aside\n', [ 'Blockquote', 'Aside']],
			['> > block\n> ^ aside\n', [ 'Blockquote', 'Aside']],
		]
		nestedBlockTestData.forEach(([md, containedTypes]) => it.skip(`parses blocks ${containedTypes} inside block data "${md.replace('\n', '\\n')}"`, () => {
			const parser = new BlockParser('>', 'Blockquote', new MfMParsers())
			const result = parser.parse(md, 0, md.length)
	
			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(containedTypes.length)
	
			containedTypes.forEach((expectedType, i) => {
				expect(result?.content[i]).toHaveProperty('type', expectedType)
			})
		}))
	
		it.skip('parses single-line paragraph data inside double-nested block correctly', () => {
			const md = '> > the quick brown fox\n'
			const parser = new BlockParser('>', 'Blockquote', new MfMParsers())
			const result = parser.parse(md, 0, md.length)
	
			expect(result).not.toBeNull()
			expect(result?.simplified).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Blockquote')
	
			const blockquote = result?.content[0] as UpdatableBlock
			expect(blockquote.simplified).toHaveLength(1)
			expect(blockquote.content[0]).toHaveProperty('type', 'Paragraph')
	
			const paragraph = blockquote.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(2)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
		})
	
		it.skip('parses paragraph data inside double-nested block correctly', () => {
			const md = '> > the quick brown fox\n> > jumps over the lazy dog\n'
			const parser = new BlockParser('>', 'Blockquote', new MfMParsers())
			const result = parser.parse(md, 0, md.length)
	
			expect(result).not.toBeNull()
			expect(result?.simplified).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Blockquote')
	
			const blockquote = result?.content[0] as UpdatableBlock
			expect(blockquote.simplified).toHaveLength(1)
			expect(blockquote.content[0]).toHaveProperty('type', 'Paragraph')
	
			const paragraph = blockquote.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(4)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
		})
	
		it.skip('parses heading data inside double-nested block correctly', () => {
			const md = '> > # the quick brown fox\n'
			const parser = new BlockParser('>', 'Blockquote', new MfMParsers())
			const result = parser.parse(md, 0, md.length)
	
			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Blockquote')
	
			const blockquote = result?.content[0] as UpdatableBlock
			expect(blockquote.simplified).toHaveLength(1)
			expect(blockquote.content[0]).toHaveProperty('type', 'Heading')
	
			const heading = blockquote.content[0] as Heading
			expect(heading).toHaveProperty('text', 'the quick brown fox')
		})
	
		it.skip('parses heading and paragraph data inside double-nested block correctly', () => {
			const md = '> > # the quick brown fox\n> > jumps over the lazy dog'
			const parser = new BlockParser('>', 'Blockquote', new MfMParsers())
			const result = parser.parse(md, 0, md.length)
	
			expect(result).not.toBeNull()
			expect(result?.simplified).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Blockquote')
	
			const blockquote = result?.content[0] as UpdatableBlock
			expect(blockquote.simplified).toHaveLength(2)
			expect(blockquote.content[0]).toHaveProperty('type', 'Heading')
	
			const heading = blockquote.content[0] as Heading
			expect(heading).toHaveProperty('text', 'the quick brown fox')
	
			expect(blockquote.content[1]).toHaveProperty('type', 'Paragraph')
	
			const paragraph = blockquote.content[1] as Paragraph
			expect(paragraph.content).toHaveLength(1)
			expect(paragraph.content[0]).toHaveProperty('content', 'jumps over the lazy dog')
		})
		
		it.skip('parses two paragraph data inside double-nested block correctly', () => {
			const md = '> > the quick brown fox\n> >\n> > jumps over the lazy dog'
			const parser = new BlockParser('>', 'Blockquote', new MfMParsers())
			const result = parser.parse(md, 0, md.length)
	
			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Blockquote')
	
			const blockquote = result?.content[0] as UpdatableBlock
			expect(blockquote.simplified).toHaveLength(2)
			expect(blockquote.content[0]).toHaveProperty('type', 'Paragraph')
	
			const paragraph1 = blockquote.content[0] as Paragraph
			expect(paragraph1.content).toHaveLength(2)
			expect(paragraph1.content[0]).toHaveProperty('content', 'the quick brown fox')
	
			expect(blockquote.content[1]).toHaveProperty('type', 'Paragraph')
	
			const paragraph2 = blockquote.content[1] as Paragraph
			expect(paragraph2.content).toHaveLength(1)
			expect(paragraph2.content[0]).toHaveProperty('content', 'jumps over the lazy dog')
		})
	})
})
