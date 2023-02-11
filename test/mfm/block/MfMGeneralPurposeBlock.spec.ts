import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMGeneralPurposeBlock, MfMGeneralPurposeBlockParser } from "$mfm/block/MfMGeneralPurposeBlock"
import { MfMHeading } from "$mfm/block/MfMHeading"
import { MfMParagraph, MfMParagraphParser } from "$mfm/block/MfMParagraph"
import { MfMSection } from "$mfm/block/MfMSection"
import { MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { createHeadingParser } from "./MfMHeading.spec"

function createGeneralPurposeBlockParser() {
	const idGenerator = new NumberedIdGenerator()
	const MfMContentLine = new MfMContentLineParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator }), ], })
	const { headingParser } = createHeadingParser()
	const MfMParagraph = new MfMParagraphParser({ idGenerator, MfMContentLine, allBlocks: [headingParser] })
	const parser = new MfMGeneralPurposeBlockParser({ idGenerator, MfMParagraph, allBlocks: [ headingParser, MfMParagraph, ] })
	return parser
}
describe('MfMGeneralPurposeBlock parser', () => {
	describe('parsing the content of single-line blocks', () => {
		it('parses an empty block', () => {
			const parser = createGeneralPurposeBlockParser()

			const result = parser.parseLine(null, '>', 0, '>'.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'block-quote')
		});
		['>', '> '].forEach(start => it(`adds the first line (starting ${start})`, () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `${start}text content`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')
		}))
		it('adds a heading as first line of a block quote', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `># text content`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'section')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'heading')
			const heading = result?.content[0].content[0] as unknown as MfMHeading
			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'text content')
		})
	})
	describe('parsing the content of multi-line blocks', () => {
		it('parses the second line of a paragraph inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> text content\n> more content`
			const first = parser.parseLine(null, text, 0, '> text content'.length)
			const result = parser.parseLine(first, text, '> text content\n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')

			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(2)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(paragraph?.content[1]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[1].content[0]).toHaveProperty('text', 'more content')
		})
		it('parses a second paragraph inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> text content\n>\n> more content`
			const first = parser.parseLine(null, text, 0, '> text content'.length)
			const second = parser.parseLine(first, text, '> text content\n'.length, '>'.length)
			const result = parser.parseLine(second, text, '> text content\n>\n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')

			const paragraph1 = result?.content[0] as unknown as MfMParagraph
			expect(paragraph1.content).toHaveLength(1)

			expect(paragraph1?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph1?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph1?.content[0].content[0]).toHaveProperty('text', 'text content')

			const paragraph2 = result?.content[1] as unknown as MfMParagraph
			expect(paragraph2.content).toHaveLength(1)

			expect(paragraph2?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph2?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph2?.content[0].content[0]).toHaveProperty('text', 'more content')
		})

		it('parses a heading after a paragraph inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> text content\n> # heading content`
			const first = parser.parseLine(null, text, 0, '> text content'.length)
			const result = parser.parseLine(first, text, '> text content\n'.length, '> # heading content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)

			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(1)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(result?.content[1]).toHaveProperty('type', 'section')
			expect(result?.content[1].content[0]).toHaveProperty('type', 'heading')
			const heading = result?.content[1].content[0] as unknown as MfMHeading
			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'heading content')
		})
		it('parses the second line of a two-line heading inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `># text content  \n> more content`
			const first = parser.parseLine(null, text, 0, '># text content  '.length)
			const result = parser.parseLine(first, text, '># text content  \n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'section')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'heading')

			const heading = result?.content[0].content[0] as unknown as MfMHeading
			expect(heading.content).toHaveLength(2)

			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(heading?.content[1]).toHaveProperty('type', 'content-line')
			expect(heading?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[1].content[0]).toHaveProperty('text', 'more content')
		})

		it('parses a two-line paragraph after a heading inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> # heading content\n> text content\n> more content`
			const first = parser.parseLine(null, text, 0, '> # heading content'.length)
			const second = parser.parseLine(first, text, '> # heading content\n'.length, '> text content'.length)
			const result = parser.parseLine(second, text, '> # heading content\n> text content\n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)

			expect(result?.content[0]).toHaveProperty('type', 'section')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'heading')

			const heading = result?.content[0].content[0] as unknown as MfMHeading
			expect(heading.content).toHaveLength(1)

			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'heading content')

			expect(result?.content[1]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[1] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(2)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(paragraph?.content[1]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[1].content[0]).toHaveProperty('text', 'more content')
		})
	})
	describe('parsing content lines', () => {
		it('contains the starting block character of an empty block', () => {
			const parser = createGeneralPurposeBlockParser()

			const result = parser.parseLine(null, '>', 0, 1) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(1)
			const line = result.lines[0]

			expect(line.content).toHaveLength(1)

			expect(line.content[0]).toHaveProperty('start', 0)
			expect(line.content[0]).toHaveProperty('length', 1)
			expect(line.content[0]).toHaveProperty('asText', `>`)
		})

		it('contains the full line of a single-line block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = '>\ta single line block'
			const result = parser.parseLine(null, text, 0, text.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(1)
			const line = result.lines[0]

			expect(line.content).toHaveLength(2)

			expect(line.content[0]).toHaveProperty('start', 0)
			expect(line.content[0]).toHaveProperty('length', 2)
			expect(line.content[0]).toHaveProperty('asText', `>\t`)

			expect(line.content[1]).toHaveProperty('start', 2)
			expect(line.content[1]).toHaveProperty('length', 'a single line block'.length)
			expect(line.content[1]).toHaveProperty('asText', 'a single line block')
		})

		it('contains the full second line of a two-line block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = '>\tfirst line\n> second line'
			const first = parser.parseLine(null, text, 0, '>\tfirst line'.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(first, text, '>\tfirst line\n'.length, '> second line'.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(2)
			const line = result.lines[1]

			expect(line.content).toHaveLength(2)

			expect(line.content[0]).toHaveProperty('start', '>\tfirst line\n'.length)
			expect(line.content[0]).toHaveProperty('length', 2)
			expect(line.content[0]).toHaveProperty('asText', `> `)

			expect(line.content[1]).toHaveProperty('start', '>\tfirst line\n'.length + 2)
			expect(line.content[1]).toHaveProperty('length', 'second line'.length)
			expect(line.content[1]).toHaveProperty('asText', 'second line')
		})
	})
})
