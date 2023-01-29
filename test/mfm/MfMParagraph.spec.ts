import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMHeading, MfMHeadingParser } from "$mfm/block/MfMHeading"
import { MfMParagraphParser } from "$mfm/block/MfMParagraph"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { Parsers } from "$parser/Parsers"
import { createHeadingParser } from "./MfMHeading.spec"

describe('MfMParagraph parser', () => {
	function createParagraphParser() {
		const idGenerator = new NumberedIdGenerator()
		const parsers: Parsers<MfMContentLineParser> = {
			idGenerator,
			MfMContentLine: new MfMContentLineParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator }), ], }),
			allBlocks: [ createHeadingParser()['headingParser'], ]
		}
		const parser = new MfMParagraphParser(parsers)
		return { parser }
	}
	describe('parsing the content', () => {
		it('parses single-line simple text content', () => {
			const { parser } = createParagraphParser()

			const text = 'hello world'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'content-line')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0].content[0]).toHaveProperty('text', text)
		})

		it('parses a second text content line', () => {
			const { parser } = createParagraphParser()

			const line1 = 'hello world'
			const line2 = 'hello marmota'
			const text = `${line1}\n${line2}`
			const first = parser.parseLine(null, text, 0, line1.length)
			const result = parser.parseLine(first, text, `${line1}\n`.length, line2.length)

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
			const { parser } = createParagraphParser()
			const line1 = 'hello world'
			const text = `${line1}\n${empty}\n---ignore me---`

			const first = parser.parseLine(null, text, 0, line1.length)
			const result = parser.parseLine(first, text, `${line1}\n`.length, empty.length)

			expect(result).toBeNull()
			expect(first).toHaveProperty('isFullyParsed', true)
		}))
		it('ends paragraph on block content (e.g. heading)', () => {
			const { parser } = createParagraphParser()
			const line1 = 'hello world'
			const heading = '# I am a heading'
			const text = `${line1}\n${heading}\n---ignore me---`

			const first = parser.parseLine(null, text, 0, line1.length)
			const result = parser.parseLine(first, text, `${line1}\n`.length, heading.length)

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