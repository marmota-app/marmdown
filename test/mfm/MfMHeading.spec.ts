import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMHeadingParser } from "$mfm/block/MfMHeading"
import { MfMSection, MfMSectionParser } from "$mfm/block/MfMSection"
import { Parsers } from "$parser/Parsers"
import { instance, mock, when } from "omnimock"

describe('MfMHeading parser', () => {
	describe('parsing the content', () => {
		['#', '##', '###', '####', '#####', '######'].forEach(token => {
			it(`creates a section with the heading\'s level "${token}", containing the heading`, () => {
				const sectionParserMock = mock(MfMSectionParser)
				when(sectionParserMock.create()).return(new MfMSection('dummy'))
				const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }

				const headingParser = new MfMHeadingParser(parsers)

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'section')
				expect(result).toHaveProperty('level', token.length)
			})
			it.skip(`creates a heading with leve ${token}`, () => {})
		})
		it.skip('parses simple text as the heading text', () => {})
	})
	describe.skip('parsing the content lines', () => {
		//TODO implement me
	})
	describe.skip('parsing updates', () => {
		//TODO implement me
	})
})