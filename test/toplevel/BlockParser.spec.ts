import { Paragraph, TextContent } from "$markdown/MarkdownDocument"
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
			expect(result?.content).toHaveProperty('type', type)
		})

		it(`does not parse line starting with a`, () => {
			const result = parse(`asdf`)
			expect(result).toBeNull()
		})

		it('parses heading inside block with correct position data', () => {
			const result = parse(`before\n${delimiter} # Heading`, 'before\n'.length)

			expect(result).toHaveProperty('startIndex', 'before\n'.length)
			expect(result).toHaveProperty('length', `${delimiter} # Heading`.length)
			expect(result?.content).toHaveProperty('type', type)
			expect(result?.content).toHaveProperty('start', 'before\n'.length)
		})

		it('parses heading inside block with correct content', () => {
			const result = parse(`before\n${delimiter} # The Heading`, 'before\n'.length)

			expect(result?.content).toHaveProperty('type', type)
			expect(result?.content.content).toHaveLength(1)
			expect(result?.content.content[0]).toHaveProperty('type', 'Heading')
			expect(result?.content.content[0]).toHaveProperty('text', 'The Heading')
		})

		it('parses options at the beginning of the block', () => {
			const result = parse(`${delimiter}{ foo=bar }`)
			expect(result?.content.options).toHaveProperty('foo', 'bar')
		})

		it('does not allow more than three spaces before a block delimiter', () => {
			const result = parse(`    ${delimiter}`)
			expect(result).toBeNull()
		})

		it.skip('parses a multi-line paragraph inside the block', () => {
			const result = parse(`${delimiter} the quick brown fox\n${delimiter}jumps over the lazy dog\n`)

			expect(result?.content.content).toHaveLength(1)
			expect(result?.content.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(4)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
		})
		it.skip('parses a multi-line paragraph inside the block', () => {
			const result = parse(`${delimiter} the quick brown fox\n${delimiter}jumps over the lazy dog\nnot part of aside`)

			expect(result?.content.content).toHaveLength(1)
			expect(result?.content.content[0]).toHaveProperty('type', 'Paragraph')

			const paragraph = result?.content.content[0] as Paragraph
			expect(paragraph.content).toHaveLength(4)
			expect(paragraph.content[0]).toHaveProperty('content', 'the quick brown fox')
			expect(paragraph.content[2]).toHaveProperty('content', 'jumps over the lazy dog')
		})
	}))
})
