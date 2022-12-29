import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMHeadingParser, MfMHeadingTextParser } from "$mfm/block/MfMHeading"
import { MfMSection, MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
import { Parsers } from "$parser/Parsers"
import { anyNumber, anyObject, anyString, instance, mock, when } from "omnimock"

describe('MfMHeading parser', () => {
	function createHeadingParser() {
		const textParserMock = mock(MfMTextParser)
		const tpParsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), allInlines: [ instance(textParserMock), ], }
		const headingTextParser = new MfMHeadingTextParser(tpParsers)

		const returnedHeadingTextMock = mock(MfMText)
		when(textParserMock.parseLine(anyObject(), anyString(), anyNumber(), anyNumber())).return(instance(returnedHeadingTextMock))

		const sectionParserMock = mock(MfMSectionParser)
		const parsers: Parsers<MfMSectionParser | MfMHeadingTextParser> = {
			idGenerator: new NumberedIdGenerator(),
			'MfMSection': instance(sectionParserMock),
			'MfMHeadingText': headingTextParser,
		}

		const headingParser = new MfMHeadingParser(parsers)

		return { headingParser, sectionParserMock, textParserMock, returnedHeadingTextMock, }
	}
	describe('parsing the content', () => {
		['#', '##', '###', '####', '#####', '######'].forEach(token => {
			it(`creates a section with the heading\'s level "${token}", containing the heading`, () => {
				const { headingParser, sectionParserMock, } = createHeadingParser()
				when(sectionParserMock.create(anyNumber())).callFake(level => new MfMSection('dummy', instance(sectionParserMock), level))

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'section')
				expect(result).toHaveProperty('level', token.length)
			})
			it(`creates a heading with level ${token}`, () => {
				const { headingParser, sectionParserMock, } = createHeadingParser()
				when(sectionParserMock.create(anyNumber())).return(new MfMSection('dummy', instance(sectionParserMock)))

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0]).toHaveProperty('level', token.length)
			})
		})
		it('parses simple text as the heading text', () => {
			const { headingParser, returnedHeadingTextMock, sectionParserMock, } = createHeadingParser()
			when(returnedHeadingTextMock.text).return('Heading Text')
			when(sectionParserMock.create(anyNumber())).return(new MfMSection('dummy', instance(sectionParserMock)))

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
	describe.skip('parsing the content lines', () => {
		//TODO implement me
	})
	describe.skip('parsing updates', () => {
		//TODO implement me
	})
})