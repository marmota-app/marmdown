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

import { ParsedLine, LineContent, Element, StringLineContent } from "../../../src/element/Element"
import { NumberedIdGenerator } from "../../../src/IdGenerator"
import { UpdateParser } from "../../../src/UpdateParser"
import { MfMHeading, MfMHeadingParser } from "../../../src/mfm/block/MfMHeading"
import { MfMSection, MfMSectionParser } from "../../../src/mfm/block/MfMSection"
import { EmptyElement } from "../../../src/parser/EmptyElementParser"
import { Parsers } from "../../../src/parser/Parsers"
import { anyObject, anything, instance, mock, when } from "omnimock"
import { createEmptyElementParser } from "../../parser/createEmptyElementParser"

describe('MfMSection parser', () => {
	describe('parsing the content', () => {
		[ 1, 2, 3, 4, 5].forEach(level => it(`adds heading (and section) of level ${level+1} to current section ${level}`, () => {
			const headingParserMock = mock(MfMHeadingParser)
			when(headingParserMock.elementName).return('MfMHeading')
	
			const parsers: Parsers<MfMHeadingParser> = { MfMHeading: instance(headingParserMock), allBlocks: [ instance(headingParserMock), ], idGenerator: new NumberedIdGenerator(), }
			const sectionParser = new MfMSectionParser(parsers)
	
			const text = `${new Array(level+1).fill('#')} Heading Text`
			const innerSection = new MfMSection('inner', sectionParser, level+1)
			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			const parsedLine = new ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, EmptyElement>('line-__dummy__', emptyElement)
			parsedLine.content.push(new StringLineContent('foo', 10, 3, emptyElement))
			emptyElement.lines.push(parsedLine)
			innerSection.addContent(emptyElement)
			when(headingParserMock.parseLine(anything(), text, 0, text.length)).return(innerSection)
	
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

	describe('parsing updates', () => {
		it('cannot update a section directyl (e.g. changing heading to paragraph), must be a re-parse', () => {
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const headingParserMock = mock(MfMHeadingParser)
			when(headingParserMock.elementName).return('MfMHeading')
	
			const parsers: Parsers<MfMHeadingParser> = { MfMHeading: instance(headingParserMock), allBlocks: [ instance(headingParserMock), ], idGenerator: new NumberedIdGenerator(), }
			const sectionParser = new MfMSectionParser(parsers)
			const section = sectionParser.create()

			const emptyElement = new EmptyElement('__dummy__', createEmptyElementParser())
			const parsedLine = new ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, EmptyElement>('line-__dummy__', emptyElement)
			parsedLine.content.push(new StringLineContent('foo', 10, 3, emptyElement))
			emptyElement.lines.push(parsedLine)
			section.addContent(emptyElement)

			const updated = updateParser.parse(section, { text: 'bar', rangeOffset: 10, rangeLength: 0, })

			expect(updated).toBeNull()
		})
		it.skip('updates start of paragraph correctly when heading before the paragraph changes', () => {})
	})
})
