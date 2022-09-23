/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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
import { mock, instance, when, verify, anyString, anyNumber, } from 'omnimock'

import { Marmdown } from "$markdown/Marmdown"
import { TextParser } from "$markdown/parser/TextParser"
import { AdvancedConent, DefaultContent, Empty } from '$markdown/MarkdownDocument'
import { ContentOptions, Options, Option, UpdatableOptions, UpdatableOption } from '$markdown/MarkdownOptions'
import { OptionParser } from '$markdown/options/OptionParser'
import { parsers, Parsers } from '$markdown/Parsers'

class TestParsers implements Parsers<'OptionsParser'> {
	constructor(private _knownParsers: {[key: string]: TextParser<any>}, private _toplevel: string[]) {}
	names() { return [] }
	knownParsers() { return this._knownParsers as any }
	toplevel() { return parsers(this.knownParsers(), this._toplevel) }
}

describe('Marmdown', () => {
	it('can supply a non-null markdown document', () => {
		const marmdown = new Marmdown('')

		expect(marmdown.document).not.toBeNull()
	})

	it('passes content to first subparser', () => {
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return(null).once()

		
		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
		}, [ 'one' ]))

		verify(firstTextParserMock)
	})

	it('passes content to next subparser when pervious subparser returns null', () => {
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser>('secondTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return(null)
		when(secondTextParserMock.parse('the content', 0, 'the content'.length)).return(null).once()

		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(secondTextParserMock)
	})

	it('passes new start index to first subparser when pervious subparser returns result', () => {
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser>('secondTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return({
			startIndex: 1,
			length: 2,
			content: { type: 'Empty', hasChanged: true, allOptions: new UpdatableOptions([], -1) },
		})
		when(firstTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null).once()
		when(secondTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null).once()

		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(firstTextParserMock)
		verify(secondTextParserMock)
	})

	it('adds parsed content to document content', () => {
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const parsedContent: Empty&DefaultContent&AdvancedConent = { type: 'Empty', hasChanged: true, allOptions: new UpdatableOptions([], -1)}
		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return({
			startIndex: 1,
			length: 2,
			content: parsedContent,
		})
		when(firstTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null)

		const subparsers: TextParser[] = [ instance(firstTextParserMock), ]
		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
		}, [ 'one' ]))

		expect(marmdown.document.content).toContain(parsedContent)
	})

	it('parses document options first', () => {
		const expectedOptions = new UpdatableOptions([ new UpdatableOption('foo=bar', 'foo', 'bar', -1, -1, new OptionParser(new TestParsers({}, []))) ], -1)
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return({
			startIndex: 1,
			length: 2,
			content: expectedOptions,
		})

		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
		}, []))

		expect(marmdown.document.options).toEqual(expectedOptions)
	})
})