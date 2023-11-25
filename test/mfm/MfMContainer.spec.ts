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

import { ParsedLine } from "../../src/element/Element"
import { NumberedIdGenerator } from "../../src/IdGenerator"
import { MfMSection, MfMSectionParser } from "../../src/mfm/block/MfMSection"
import { MfMContainer, MfMContainerParser } from "../../src/mfm/MfMContainer"
import { Parsers } from "../../src/parser/Parsers"
import { anyNumber, anyString, instance, mock, verify, when } from "omnimock"
import { createHeadingParser } from "./block/createHeadingParser"
import { createParagraphParser } from "./block/createParagraphParser"
import { createOptionsParser } from "./options/createOptionsParser"
import { MfMOptionsParser } from "../../src/mfm/options/MfMOptions"
import { UpdateParser } from "../../src/UpdateParser"
import { EmptyElement, EmptyElementParser } from "../../src/parser/EmptyElementParser"
import { createEmptyElementParser } from "../parser/createEmptyElementParser"
import { MfMHeadingParser } from "../../src/mfm/block/MfMHeading"

describe('MfMContainer parser', () => {
	function createSectionParserMock() {
		const sectionParserMock = mock(MfMSectionParser)
		const dummySection = new MfMSection('dummy', instance(sectionParserMock))
		when(sectionParserMock.create(anyNumber())).return(dummySection).anyTimes()
		when(sectionParserMock.parseLine(dummySection, anyString(), anyNumber(), anyNumber())).return(null).anyTimes()
		return sectionParserMock
	}
	function createContainerParser() {
		const emptyElementParser = createEmptyElementParser()
		const { paragraphParser, } = createParagraphParser(emptyElementParser)
		const { headingParser, sectionParser } = createHeadingParser([emptyElementParser, paragraphParser])

		const optionsParser = createOptionsParser()
		const parsers: Parsers<MfMSectionParser | MfMOptionsParser | MfMHeadingParser | EmptyElementParser> = { 
			'MfMOptions': optionsParser,
			'MfMHeading': headingParser, 
			'MfMSection': sectionParser,
			'EmptyElement': emptyElementParser,
			allBlocks: [ emptyElementParser, headingParser, paragraphParser, sectionParser ],
			idGenerator: new NumberedIdGenerator(),
		}

		return new MfMContainerParser(parsers)
	}
	describe('parsing the content', () => {
		it('parses the file content into a section when there are no options (no previous section found)', () => {
			const sectionParserMock = createSectionParserMock()
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 
				'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(),
			}
	
			const containerParser = new MfMContainerParser(parsers)
			containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			verify(sectionParserMock)
		})
		it('returns null when section could not be parsed', () => {
			const sectionParserMock = createSectionParserMock()
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(null).once()
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container).toBeNull()
		})
		it('returns the container when section could be parsed', () => {
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(section).once()
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container).not.toBeNull()
		})
		it('parses the file content into a section when there are no options (previous section found and handles content)', () => {
			const text = 'some container line\nsecond line'
			
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			emptyElement.lines.push(new ParsedLine('line-__dummy__', emptyElement))
			section.addContent(emptyElement)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).anyTimes()
			
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('returns null when section could not be parsed after second line', () => {
			const text = 'some container line\nsecond line'
	
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			emptyElement.lines.push(new ParsedLine('line-__dummy__', emptyElement))
			section.addContent(emptyElement)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).anyTimes()
	
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			let container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			container = containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			expect(container).toBeNull()
		})
	
		it('parses the file content into a new section when there are no options (previous section found but does not handle content)', () => {
			const text = 'some container line\nsecond line'
	
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			emptyElement.lines.push(new ParsedLine('line-__dummy__', emptyElement))
			section.addContent(emptyElement)
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
	
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser,'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('parses the file content into a new section when there are no options (previous section found but is fully parsed)', () => {
			const text = 'some container line\nsecond line'
	
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			emptyElement.lines.push(new ParsedLine('line-__dummy__', emptyElement))
			section.addContent(emptyElement)
			section.sectionCompleted = true
	
			when(sectionParserMock.parseLine(null, text, 0, 'some container line'.length)).return(section).anyTimes()
			when(sectionParserMock.parseLine(section, text, 'some container line\n'.length, 'second line'.length)).return(null).never()
			when(sectionParserMock.parseLine(null, text, 'some container line\n'.length, 'second line'.length)).return(null).once()
	
			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, text, 0, 'some container line'.length)
			containerParser.parseLine(container, text, 'some container line\n'.length, 'second line'.length)
	
			verify(sectionParserMock)
		})
		it('only contains one section when the first parsed line comes from a section', () => {
			const sectionParserMock = createSectionParserMock()
			const section = new MfMSection('dummy', instance(sectionParserMock))
			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			emptyElement.lines.push(new ParsedLine('line-__dummy__', emptyElement))
			section.addContent(emptyElement)
			when(sectionParserMock.parseLine(null, 'some container line', 0, 'some container line'.length)).return(section).once()

			const optionsParser = createOptionsParser()
			const emptyElementParser = createEmptyElementParser()
			const parsers: Parsers<MfMSectionParser | MfMOptionsParser | EmptyElementParser> = { 'EmptyElement': emptyElementParser, 'MfMOptions': optionsParser, 'MfMSection': instance(sectionParserMock), allBlocks: [ instance(sectionParserMock) ], idGenerator: new NumberedIdGenerator(), }
	
			const containerParser = new MfMContainerParser(parsers)
			const container = containerParser.parseLine(null, 'some container line', 0, 'some container line'.length)
	
			expect(container?.content?.length).toEqual(1)
		});
		[ '', '   ', '\t', '   \t  \t '].forEach(empty => it(`parses unmapped empty line "${empty.replaceAll('\t', '\\t')}" as line of the container`, () => {
			const containerParser = createContainerParser()

			const container = containerParser.parseLine(null, empty, 0, empty.length)
	
			expect(container).not.toBeNull()
			expect(container?.lines.length).toBeGreaterThanOrEqual(1)
			expect(container?.lines[container.lines.length-1]).toHaveProperty('asText', empty)
		}));

		it('contains the correct section content for document with different elements', () => {
			const containerParser = createContainerParser()

			const lines = [
				'The quick brown fox',
				'jumps over the lazy dog',
				'',
				'Sphinx of black quartz',
				'judge my vow',
				'# A heading  ',
				'with a second line',
				'',
				'And another paragraph',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()
			expect(container?.content).toHaveLength(2)

			expect(container?.content[0]).toHaveProperty('type', 'section')
			expect(container?.content[0].content).toHaveLength(3)
			expect(container?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(container?.content[0].content[1]).toHaveProperty('type', '--empty--')
			expect(container?.content[0].content[2]).toHaveProperty('type', 'paragraph')

			expect(container?.content[1]).toHaveProperty('type', 'section')
			expect(container?.content[1].content).toHaveLength(3)
			expect(container?.content[1].content[0]).toHaveProperty('type', 'heading')
			expect(container?.content[1].content[1]).toHaveProperty('type', '--empty--')
			expect(container?.content[1].content[2]).toHaveProperty('type', 'paragraph')
		})

	})
	describe('parsing the content lines', () => {
		it('contains a line in the container for each line of the file content', () => {
			const containerParser = createContainerParser()

			const lines = [
				[ 'The quick brown fox',     [0, 'paragraph'], ],
				[ 'jumps over the lazy dog', [0, 'paragraph'], ],
				[ '',                        [], ],
				[ 'Sphinx of black quartz',  [0, 'paragraph'], ],
				[ 'judge my vow',            [0, 'paragraph'], ],
				[ '# A heading  ',           [1, 'heading'], ],
				[ 'with a second line',      [1, 'heading'], ],
				[ '',                        [], ],
				[ 'And another paragraph',   [1, 'paragraph'], ],
			]
			const text = lines.map(l => l[0]).join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current[0].length),
					start: previous.start + current[0].length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()

			expect(container?.lines).toHaveLength(lines.length)
			container?.lines.forEach((line, i) => {
				expect(line.asText).toEqual(lines[i][0])
				expect(line.belongsTo).toBe(container)
				if(lines[i][1].length > 0) {
					expect(line.content[0].belongsTo).toEqual(container.content[lines[i][1][0] as number])
					expect((line.content[0] as ParsedLine<any, any>).content[0].belongsTo).toHaveProperty('type', lines[i][1][1])
				}
			})
		})
	})
	describe('parsing options and options lines', () => {
		it('parses the document options', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value; key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()
			expect(container?.content).toHaveLength(1)

			expect(container?.options.get('default')).toEqual('default value')
			expect(container?.options.get('key2')).toEqual('value2')
		})
		it('parses the document options when content is on the same line', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value; key2 = value2} The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()
			expect(container?.content).toHaveLength(1)

			expect(container?.options.get('default')).toEqual('default value')
			expect(container?.options.get('key2')).toEqual('value2')

			expect(container?.lines).toHaveLength(2)
			expect(container?.lines[0].asText).toEqual(lines[0])
			expect(container?.lines[1].asText).toEqual(lines[1])
		})
		it('parses the document options when content is on the same line, without whitespace', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value; key2 = value2}The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()
			expect(container?.content).toHaveLength(1)

			expect(container?.options.get('default')).toEqual('default value')
			expect(container?.options.get('key2')).toEqual('value2')

			expect(container?.lines).toHaveLength(2)
			expect(container?.lines[0].asText).toEqual(lines[0])
			expect(container?.lines[1].asText).toEqual(lines[1])
		})
		it('adds the correct document structure after the document options', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value; key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()
			expect(container?.content).toHaveLength(1)


			expect(container?.content[0].content).toHaveLength(1)
			expect(container?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(container?.content[0].content[0].lines).toHaveLength(2)
			expect(container?.content[0].content[0].lines[0].asText).toEqual(lines[1])
			expect(container?.content[0].content[0].lines[1].asText).toEqual(lines[2])
		})
		it('does not add options to the container if they do not appear on the first line', () => {
			const containerParser = createContainerParser()

			const lines = [
				'',
				'{ default value; key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()
			expect(container?.content).toHaveLength(1)

			expect(container?.options.get('default')).toBeUndefined()
			expect(container?.options.get('key2')).toBeUndefined()
		})
		it('adds two-line document options to the document, with all their lines', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()

			expect(container?.content).toHaveLength(1)
			expect(container?.content[0].lines).toHaveLength(2)

			expect(container?.lines).toHaveLength(lines.length)
			container?.lines.forEach((l, i) => expect(l.asText).toEqual(lines[i]))

			expect(container?.options.lines[0].asText).toEqual(lines[0])
			expect(container?.options.lines[1].asText).toEqual(lines[1])
			expect(container?.options.get('default')).toEqual('default value')
			expect(container?.options.get('key2')).toEqual('value2')
		})
		it('ignores empty lines between options and the first content line when there are options', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ key2 = value2}',
				'  \t  ',
				'',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()

			expect(container?.content).toHaveLength(1)
			expect(container?.content[0].lines).toHaveLength(4)

			expect(container?.lines).toHaveLength(lines.length)

			expect(container?.options.get('key2')).toEqual('value2')
		})
		it('can parse content after options in the same line', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ key2 = value2} The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result

			expect(container).not.toBeNull()

			expect(container?.content).toHaveLength(1)
			expect(container?.content[0].lines).toHaveLength(2)
			expect(container?.content[0].lines[0].asText).toEqual('The quick brown fox')
			expect(container?.content[0].lines[1].asText).toEqual('jumps over the lazy dog')

			expect(container?.lines).toHaveLength(lines.length)
			expect(container?.lines[0].asText).toEqual(lines[0])
			expect(container?.lines[1].asText).toEqual(lines[1])
		})
	})
	describe('parsing updates', () => {
		const updateParser = new UpdateParser(new NumberedIdGenerator())
		
		it('parses update inside a paragraph in the container', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result as MfMContainer

			const updated = updateParser.parse(container, { 
				text: ', smart',
				rangeOffset: lines[0].length+lines[1].length+2+'The quick'.length,
				rangeLength: 0,
			}) as MfMContainer

			expect(updated).not.toBeNull()
			const paragraph = updated.content[0].content[0]
			expect(paragraph.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph.content[0].content[0]).toHaveProperty('text', 'The quick, smart brown fox')

			expect(updated.lines[0].asText).toEqual(lines[0])
			expect(updated.lines[1].asText).toEqual(lines[1])
			expect(updated.lines[2].asText).toEqual('The quick, smart brown fox')
			expect(updated.lines[3].asText).toEqual(lines[3])
		})
		it('parses an update with a newline inside a paragraph in the container', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result as MfMContainer

			const updated = updateParser.parse(container, { 
				text: '\n',
				rangeOffset: lines[0].length+lines[1].length+2+'The quick'.length,
				rangeLength: 1,
			})

			expect(updated).toBeNull()
		})
		it('parses an update inside a closed, multi-line options block inside the container', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result as MfMContainer

			const updated = updateParser.parse(container, { 
				text: ';key3=value3 ',
				rangeOffset: lines[0].length+1+'key2 = value2'.length,
				rangeLength: 0,
			}) as MfMContainer

			expect(updated).not.toBeNull()
			expect(updated.options.get('key3')).toEqual('value3')

			expect(updated.lines[0].asText).toEqual(lines[0])
			expect(updated.lines[1].asText).toEqual('key2 = value2;key3=value3 }')
			expect(updated.lines[2].asText).toEqual(lines[2])
			expect(updated.lines[3].asText).toEqual(lines[3])
		})

		it('parses an update inside a un-closed, multi-line options block inside the container', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result as MfMContainer

			const updated = updateParser.parse(container, { 
				text: ';key3=value3',
				rangeOffset: lines[0].length+1+'key2 = value2'.length,
				rangeLength: 0,
			})

			expect(updated).toBeNull()
		})

		it('parses an update after an un-closed, multi-line options block inside the container', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result as MfMContainer

			const updated = updateParser.parse(container, { 
				text: ', smart',
				rangeOffset: lines[0].length+lines[1].length+2+'The quick'.length,
				rangeLength: 0,
			}) as MfMContainer

			expect(updated).toBeNull()
		})

		it('parses an update inside a closed, multi-line options block inside the container, removing the closing bracket', () => {
			const containerParser = createContainerParser()

			const lines = [
				'{ default value',
				'key2 = value2}',
				'The quick brown fox',
				'jumps over the lazy dog',
			]
			const text = lines.join('\n')

			const container = lines.reduce((previous: { result: MfMContainer | null, start: number}, current) =>
				({ 
					result: containerParser.parseLine(previous.result, text, previous.start, current.length),
					start: previous.start + current.length + 1,
				})
			, { result: null, start: 0, }).result as MfMContainer

			const updated = updateParser.parse(container, { 
				text: '',
				rangeOffset: lines[0].length+1+'key2 = value2'.length,
				rangeLength: 1,
			})

			expect(updated).toBeNull()
		})
	})
})
