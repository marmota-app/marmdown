import { MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMContainerParser } from "$mfm/MfMContainer"
import { Parsers } from "$parser/Parsers"
import { instance, mock, verify, when } from "omnimock"

describe('MfMContainer', () => {
	it('parses the file content into a section when there are no options (no previous section found)', () => {
		const sectionParserMock = mock(MfMSectionParser)
		when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
		const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock) }

		const containerParser = new MfMContainerParser(parsers)
		containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)

		verify(sectionParserMock)
	})
	it.skip('parses the file content into a section when there are no options (previous section found and handles content)', () => {})
	it.skip('parses the file content into a new section when there are no options (previous section found but does not handle content)', () => {})
	it.skip('ignores empty lines before the first content line when there are no options', () => {})
	it.skip('parses the document options', () => {})
	it.skip('ignores empty lines between options and the first content line when there are options', () => {})
})
