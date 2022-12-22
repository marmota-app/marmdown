import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMSection, MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMContainerParser } from "$mfm/MfMContainer"
import { Parsers } from "$parser/Parsers"
import { instance, mock, verify, when } from "omnimock"

describe('MfMContainer parser', () => {
	describe('parsing the content', () => {
		it('parses the file content into a section when there are no options (no previous section found)', () => {
			const sectionParserMock = mock(MfMSectionParser)
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			verify(sectionParserMock)
		})
		it('returns null when section could not be parsed', () => {
			const sectionParserMock = mock(MfMSectionParser)
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container).toBeNull()
		})
		it('returns the container when section could be parsed', () => {
			const section = new MfMSection('dummy')
			const sectionParserMock = mock(MfMSectionParser)
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(section).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container).not.toBeNull()
		})
		it('parses the file content into a section when there are no options (previous section found and handles content)', () => {
			const text = 'some container line\nsecond line'
			
			const section = new MfMSection('dummy')
			const sectionParserMock = mock(MfMSectionParser)
			section.parsedWith = instance(sectionParserMock)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).anyTimes()
			
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('returns null when section could not be parsed after second line', () => {
			const text = 'some container line\nsecond line'
	
			const section = new MfMSection('dummy')
			const sectionParserMock = mock(MfMSectionParser)
			section.parsedWith = instance(sectionParserMock)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).anyTimes()
	
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			let container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			container = containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			expect(container).toBeNull()
		})
	
		it('parses the file content into a new section when there are no options (previous section found but does not handle content)', () => {
			const text = 'some container line\nsecond line'
	
			const section = new MfMSection('dummy')
			const sectionParserMock = mock(MfMSectionParser)
			section.parsedWith = instance(sectionParserMock)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
	
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('parses the file content into a new section when there are no options (previous section found but is fully parsed)', () => {
			const text = 'some container line\nsecond line'
	
			const section = mock(MfMSection)
			const sectionParserMock = mock(MfMSectionParser)
			when(section.isFullyParsed).return(true)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).never()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
	
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it.skip('parses the document options', () => {})
		it.skip('ignores empty lines between options and the first content line when there are options', () => {})	
	})
	describe.skip('parsing the content lines', () => {
		//TODO implement me
	})
	describe.skip('parsing updates', () => {
		//TODO implement me
	})
})
