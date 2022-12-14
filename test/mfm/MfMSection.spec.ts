import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMHeading, MfMHeadingParser } from "$mfm/block/MfMHeading"
import { MfMSection, MfMSectionParser } from "$mfm/block/MfMSection"
import { Parsers } from "$parser/Parsers"
import { anyObject, anything, instance, mock, when } from "omnimock"

describe('MfMSection parser', () => {
	[ 1, 2, 3, 4, 5].forEach(level => it(`adds heading (and section) that level ${level+1} to current section ${level}`, () => {
		const headingParserMock = mock(MfMHeadingParser)
		when(headingParserMock.elementName).return('MfMHeading')

		const parsers: Parsers<MfMHeadingParser> = { MfMHeading: instance(headingParserMock), allBlocks: [ instance(headingParserMock), ], idGenerator: new NumberedIdGenerator(), }
		const sectionParser = new MfMSectionParser(parsers)

		const text = `${new Array(level+1).fill('#')} Heading Text`
		when(headingParserMock.parseLine(anything(), text, 0, text.length)).return(new MfMSection('inner', sectionParser, level+1))

		const previousSection = new MfMSection('prev', sectionParser, level)

		const result = sectionParser.parseLine(previousSection, text, 0, text.length)

		expect(result).not.toBeNull()
		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'section')
		expect(result?.content[0]).toHaveProperty('level', level+1)
	}));
	
	[ 1, 2, 3, 4, 5, 6].forEach(level => it(`ends current section ${level} when there is a new heading with the section\'s level ${level}`, () => {
		const headingParserMock = mock(MfMHeadingParser)
		when(headingParserMock.elementName).return('MfMHeading')

		const parsers: Parsers<MfMHeadingParser> = { MfMHeading: instance(headingParserMock), allBlocks: [ instance(headingParserMock), ], idGenerator: new NumberedIdGenerator(), }
		const sectionParser = new MfMSectionParser(parsers)

		const text = `${new Array(level).fill('#')} Heading Text`
		when(headingParserMock.parseLine(anything(), text, 0, text.length)).return(new MfMSection('inner', sectionParser, level))

		const previousSection = new MfMSection('prev', sectionParser, level)

		const result = sectionParser.parseLine(previousSection, text, 0, text.length)

		expect(result).toBeNull()
	}));
	[ 2, 3, 4, 5, 6].forEach(level => it(`ends current section ${level} when there is a new heading with level ${level-1}`, () => {
		const headingParserMock = mock(MfMHeadingParser)
		when(headingParserMock.elementName).return('MfMHeading')

		const parsers: Parsers<MfMHeadingParser> = { MfMHeading: instance(headingParserMock), allBlocks: [ instance(headingParserMock), ], idGenerator: new NumberedIdGenerator(), }
		const sectionParser = new MfMSectionParser(parsers)

		const text = `${new Array(level).fill('#')} Heading Text`
		when(headingParserMock.parseLine(anything(), text, 0, text.length)).return(new MfMSection('inner', sectionParser, level-1))

		const previousSection = new MfMSection('prev', sectionParser, level)

		const result = sectionParser.parseLine(previousSection, text, 0, text.length)

		expect(result).toBeNull()
	}));
	it.skip('parses paragraph content into section when there is no heading', () => {})
})
