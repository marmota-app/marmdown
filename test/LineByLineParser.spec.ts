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

import { LineByLineParser, ParseError } from "../src/LineByLineParser"
import { MfMSectionParser } from "../src/mfm/block/MfMSection"
import { MfMContainer, MfMContainerParser } from "../src/mfm/MfMContainer"
import { anyObject, instance, mock, verify, when } from "omnimock"
import { ParserUtils } from "../src/parser/Parser"

describe('LineByLineParser', () => {
	const sectionParserMock = mock(MfMSectionParser)
	it('passes the complete document to the given parser when there are no lines', () => {
		const containerParserMock = mock(MfMContainerParser)
		when(containerParserMock.parseLine(null, 'the text', 0, 'the text'.length, anyObject()))
			.return(new MfMContainer('expected result', instance(containerParserMock), instance(sectionParserMock)))
			.once()

		const parser = new LineByLineParser(instance(containerParserMock))
		parser.parse('the text')

		verify(containerParserMock)
	})
	it('passes both lines and the previous content to the container parser mock', () => {
		const text = 'Sphinx of black quartz,\njudge my vow.'

		const containerParserMock = mock(MfMContainerParser)
		const container = new MfMContainer('expected result', instance(containerParserMock), instance(sectionParserMock))
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length, anyObject()))
			.return(container)
			.once()
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length, anyObject()))
			.return(container)
			.once()

		const parser = new LineByLineParser(instance(containerParserMock))
		const doc = parser.parse(text)

		expect(doc).toEqual(container)
		verify(containerParserMock)
	})
	it('throws an error if a line in the middle of the document cannot be parsed', () => {
		const text = 'Sphinx of black quartz,\njudge my vow.'

		const containerParserMock = mock(MfMContainerParser)
		const container = new MfMContainer('a container', instance(containerParserMock), instance(sectionParserMock))
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length, anyObject()))
			.return(container)
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length, anyObject()))
			.return(null)

		const parser = new LineByLineParser(instance(containerParserMock))
		expect(() => parser.parse(text)).toThrow(ParseError)
	})
	it('throws an error if a line in the middle suddenly returns a different container', () => {
		const text = 'Sphinx of black quartz,\njudge my vow.'

		const containerParserMock = mock(MfMContainerParser)
		const container = new MfMContainer('a container', instance(containerParserMock), instance(sectionParserMock))
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length, anyObject()))
			.return(container)
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length, anyObject()))
			.return(new MfMContainer('different container', instance(containerParserMock), instance(sectionParserMock)))

		const parser = new LineByLineParser(instance(containerParserMock))
		expect(() => parser.parse(text)).toThrow(ParseError)
	})
	it('passes a working lookahead function to the container parser: lookahead returns next line', () => {
		const text = 'Sphinx of black quartz,\njudge my vow.'
		var lookahead: ParserUtils['lookahead'] | undefined

		const containerParserMock = mock(MfMContainerParser)
		const container = new MfMContainer('expected result', instance(containerParserMock), instance(sectionParserMock))
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length, anyObject()))
			.callFake((prev: any, text: string, start: number, length: number, utils?: ParserUtils) => {
				lookahead = utils?.lookahead
				return container
			})
			.once()
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length, anyObject()))
			.return(container)
			.once()

		const parser = new LineByLineParser(instance(containerParserMock))
		parser.parse(text)
		
		verify(containerParserMock)
		expect(lookahead).not.toBeUndefined()
		expect(lookahead?.()).toEqual([
			'Sphinx of black quartz,\n'.length,
			'judge my vow.'.length,
		])
	})
	it('passes a working lookahead function to the container parser: lookahead returns null for last line', () => {
		const containerParserMock = mock(MfMContainerParser)
		var lookahead: ParserUtils['lookahead'] | undefined

		when(containerParserMock.parseLine(null, 'the text', 0, 'the text'.length, anyObject()))
			.callFake((prev: any, text: string, start: number, length: number, utils?: ParserUtils) => {
				lookahead = utils?.lookahead
				return new MfMContainer('expected result', instance(containerParserMock), instance(sectionParserMock))
			})
			.once()

		const parser = new LineByLineParser(instance(containerParserMock))
		parser.parse('the text')

		verify(containerParserMock)
		expect(lookahead).not.toBeUndefined()
		expect(lookahead?.()).toBeNull()
	})
})
