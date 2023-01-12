import { LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMHeading, MfMHeadingParser, MfMHeadingText, MfMHeadingTextParser } from "$mfm/block/MfMHeading"
import { MfMSection, MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
import { Parsers } from "$parser/Parsers"
import { anyNumber, anyObject, anyString, instance, mock, when } from "omnimock"

describe('MfMHeading parser', () => {
	function createHeadingParser() {
		const textParser = new MfMTextParser({ idGenerator: new NumberedIdGenerator() })
		const tpParsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), allInlines: [ textParser, ], }
		const headingTextParser = new MfMHeadingTextParser(tpParsers)

		const sectionParser = new MfMSectionParser({ idGenerator: new NumberedIdGenerator() })
		const parsers: Parsers<MfMSectionParser | MfMHeadingTextParser> = {
			idGenerator: new NumberedIdGenerator(),
			'MfMSection': sectionParser,
			'MfMHeadingText': headingTextParser,
		}

		const headingParser = new MfMHeadingParser(parsers)

		return { headingParser, sectionParser, }
	}
	describe('parsing the content', () => {
		['#', '##', '###', '####', '#####', '######'].forEach(token => {
			it(`creates a section with the heading\'s level "${token}", containing the heading`, () => {
				const { headingParser, sectionParser, } = createHeadingParser()

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'section')
				expect(result).toHaveProperty('level', token.length)
			})
			it(`creates a heading with level ${token}`, () => {
				const { headingParser, } = createHeadingParser()

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0]).toHaveProperty('level', token.length)
			})
		})
		it('parses simple text as the heading text', () => {
			const { headingParser, } = createHeadingParser()

			const text = `# Heading Text`
			const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

			expect(result.content[0].content).toHaveLength(1)
			const headingContent = result.content[0].content[0]
			expect(headingContent).toHaveProperty('type', 'heading-text')
			expect(headingContent.content).toHaveLength(1)
			expect(headingContent.content[0]).toHaveProperty('text', 'Heading Text')
		})
		it.skip('parses heading options before the heading text', () => {})
	})
	describe.skip('multi-line headings', () => {
		//TODO implement me
	})
	describe('parsing the content lines', () => {
		['#', '##', '###', '####', '#####', '######'].forEach(token => {
			it(`adds the only line of a single-line "${token}" heading to the line structure`, () => {
				const { headingParser, } = createHeadingParser()
	
				const text = `${token} Heading Text`
				const section = headingParser.parseLine(null, text, 0, text.length) as MfMSection
				const result = section.content[0] as MfMHeading
	
				expect(result.lines).toHaveLength(1)
				const line = result.lines[0]
	
				expect(line.content).toHaveLength(2)
	
				expect(line.content[0]).toHaveProperty('start', 0)
				expect(line.content[0]).toHaveProperty('length', token.length + 1)
				expect(line.content[0]).toHaveProperty('asText', `${token} `)
	
				expect(line.content[1]).toHaveProperty('start', token.length + 1)
				expect(line.content[1]).toHaveProperty('length', 'Heading Text'.length)
				expect(line.content[1]).toHaveProperty('asText', 'Heading Text')
			})
		})
		//TODO add cases for multi-line headings
	})
})