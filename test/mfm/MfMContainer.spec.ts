/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

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

import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMSection, MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMContainerParser } from "$mfm/MfMContainer"
import { Parsers } from "$parser/Parsers"
import { anyNumber, anyString, instance, mock, verify, when } from "omnimock"

describe('MfMContainer parser', () => {
	function createSectionParserMock() {
		const sectionParserMock = mock(MfMSectionParser)
		const dummySection = new MfMSection('dummy', instance(sectionParserMock))
		when(sectionParserMock.create(anyNumber())).return(dummySection).anyTimes()
		when(sectionParserMock.parseLine(dummySection, anyString(), anyNumber(), anyNumber())).return(null).anyTimes()
		return sectionParserMock
	}
	describe('parsing the content', () => {
		it('parses the file content into a section when there are no options (no previous section found)', () => {
			const sectionParserMock = createSectionParserMock()
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			verify(sectionParserMock)
		})
		it('returns null when section could not be parsed', () => {
			const sectionParserMock = createSectionParserMock()
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container).toBeNull()
		})
		it('returns the container when section could be parsed', () => {
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(section).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container).not.toBeNull()
		})
		it('parses the file content into a section when there are no options (previous section found and handles content)', () => {
			const text = 'some container line\nsecond line'
			
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).anyTimes()
			
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('returns null when section could not be parsed after second line', () => {
			const text = 'some container line\nsecond line'
	
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).anyTimes()
	
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			let container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			container = containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			expect(container).toBeNull()
		})
	
		it('parses the file content into a new section when there are no options (previous section found but does not handle content)', () => {
			const text = 'some container line\nsecond line'
	
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
	
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('parses the file content into a new section when there are no options (previous section found but is fully parsed)', () => {
			const text = 'some container line\nsecond line'
	
			const sectionParserMock = createSectionParserMock()
			const section = mock(MfMSection, new MfMSection('dummy', instance(sectionParserMock)))
			when(section.isFullyParsed).return(true)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(instance(section)).anyTimes()
			when(sectionParserMock.parseLine(instance(section), text, 'some container line\n'.length, 'second line'.length)).return(null).never()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
	
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('removes the first section if it is empty', () => {
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(section).once()
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container?.content?.length).toEqual(1)
		});
		[ '', '   ', '\t', '   \t  \t '].forEach(empty => it(`parses unmapped empty line "${empty.replaceAll('\t', '\\t')}" as line of the container`, () => {
			const sectionParser = new MfMSectionParser({ idGenerator: new NumberedIdGenerator() })
			const parsers: Parsers<MfMSectionParser> = { 'MfMSection': sectionParser, allBlocks: [ sectionParser ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, empty, 0, empty.length)
	
			expect(container).not.toBeNull()
			expect(container?.lines.length).toBeGreaterThanOrEqual(1)
			expect(container?.lines[container.lines.length-1]).toHaveProperty('asText', empty)
		}));

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
