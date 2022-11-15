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
import { mock, instance, when, verify, anyString, anyNumber, anything, } from 'omnimock'

import { Marmdown } from "$markdown/Marmdown"
import { TextParser } from "$markdown/parser/TextParser"
import { AdvancedConent, DefaultContent, Empty } from '$markdown/MarkdownDocument'
import { ContentOptions, Options, Option, UpdatableOptions, UpdatableOption } from '$markdown/MarkdownOptions'
import { OptionParser } from '$markdown/options/OptionParser'
import { GenericParser, parsers, Parsers } from '$markdown/Parsers'
import { UpdatableParagraph } from '$markdown/toplevel/ParagraphParser'
import { HeadingParser, UpdatableHeading } from '$markdown/toplevel/HeadingParser'
import { OptionsParser } from '$markdown/options/OptionsParser'
import { UpdatableElement } from '$markdown/UpdatableElement'
import { ParsedDocumentContent, Updatable } from '$markdown/Updatable'

class TestParsers<T extends string> implements Parsers<'OptionsParser' | T> {
	constructor(private _knownParsers: {[key in 'OptionsParser' | T]: GenericParser }, private _toplevel: string[]) {}
	names() { return [] }
	knownParsers() { return this._knownParsers }
	toplevel() { return parsers(this.knownParsers(), this._toplevel) }
}

class ParsedTestContent extends ParsedDocumentContent<ParsedTestContent, unknown> {
	constructor(start: number, length: number, contained: ParsedDocumentContent<unknown, unknown>[]) {
		super(start, length, undefined, contained)
	}
}
interface TestContent extends Updatable<TestContent, unknown, ParsedTestContent> {
}
class UpdatableTestContent extends UpdatableElement<TestContent, unknown, ParsedTestContent> {
}

describe('Marmdown', () => {
	it('can supply a non-null markdown document', () => {
		const marmdown = new Marmdown('')

		expect(marmdown.document).not.toBeNull()
	})

	it('passes whole content to first subparser if it\'s only a single line', () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		when(firstTextParserMock.parse(null, 'the content', 0, 'the content'.length)).return([null,null]).once()
		
		const marmdown = new Marmdown('the content', new TestParsers<'one'>({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
		}, [ 'one' ]))

		verify(firstTextParserMock)
	})
	
	const endings = [ '\n', '\r', '\r\n', ]
	endings.forEach(ending => it(`passes first line (until ${ending.replace('\n', '\\n').replace('\r', '\\r')}) content to first subparser`, () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([null,null]).once()
		
		const marmdown = new Marmdown(`the content${ending}with more content`, new TestParsers<'one'>({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
		}, [ 'one' ]))

		verify(firstTextParserMock)
	}))

	it('passes content to next subparser when pervious subparser returns null', () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
		when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([null,null]).once()
		when(secondTextParserMock.parse(null, anyString(),  0, 'the content'.length)).return([null, null]).once()

		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(secondTextParserMock)
	})

	endings.forEach(ending => {
		it(`passes new start index to first subparser when pervious subparser returns result (until ${ending.replace('\n', '\\n').replace('\r', '\\r')})`, () => {
			const optionsParserMock = mock<OptionsParser>('optionsParserMock')
			when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])
	
			const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
			const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
			when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([new UpdatableTestContent(), new ParsedTestContent(0, 3, []), ])
			when(firstTextParserMock.parse(anything(), anyString(), 3, 'the content'.length-3)).return([null, null, ]).atLeastOnce()
			when(secondTextParserMock.parse(anything(), anyString(), 3, 'the content'.length-3)).return([null, null, ]).atLeastOnce()
	
			const marmdown = new Marmdown(`the content${ending}more content`, new TestParsers({
				'OptionsParser': instance(optionsParserMock),
				'one': instance(firstTextParserMock),
				'two': instance(secondTextParserMock),
			}, [ 'one', 'two' ]))
	
			verify(firstTextParserMock)
			verify(secondTextParserMock)
		})
		it(`passes second line to first parser after first line was successfully parsed (until ${ending.replace('\n', '\\n').replace('\r', '\\r')})`, () => {
			const optionsParserMock = mock<OptionsParser>('optionsParserMock')
			when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])
	
			const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
			const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
			const previousContent = new UpdatableTestContent()
			when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([previousContent, new ParsedTestContent(0, 'the content'.length, []), ])
			when(firstTextParserMock.parse(previousContent, anyString(), `the content${ending}`.length, 'more content'.length)).return([previousContent, new ParsedTestContent(`the content${ending}`.length, 'more content'.length, []), ]).once()
			when(secondTextParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null, ]).anyTimes()
	
			const marmdown = new Marmdown(`the content${ending}more content`, new TestParsers({
				'OptionsParser': instance(optionsParserMock),
				'one': instance(firstTextParserMock),
				'two': instance(secondTextParserMock),
			}, [ 'one', 'two' ]))
	
			verify(firstTextParserMock)
			verify(secondTextParserMock)
		})	
	})
	it('passes second line to previous parser first', () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
		const previousContent = new UpdatableTestContent()
		when(secondTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([previousContent, new ParsedTestContent(0, 'the content'.length, []), ])
		when(secondTextParserMock.parse(previousContent, anyString(), 'the content\n'.length, 'more content'.length)).return([previousContent, new ParsedTestContent(12, 'more content'.length, []), ]).once()
		when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([null, null, ]).anyTimes()
		when(firstTextParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null, ]).never()

		const marmdown = new Marmdown('the content\nmore content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(firstTextParserMock)
		verify(secondTextParserMock)
	})
	it('passes second line to first and second parser again when previous parser did not parse successfully', () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
		const previousContent = new UpdatableTestContent()
		when(secondTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([previousContent, new ParsedTestContent(0, 'the content'.length, []), ])
		when(secondTextParserMock.parse(previousContent, anyString(), 'the content\n'.length, 'more content'.length)).return([ null, null, ]).once()
		when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([null, null, ]).anyTimes()
		when(firstTextParserMock.parse(null, anyString(), 'the content\n'.length, 'more content'.length)).return([null, null, ]).once()
		when(secondTextParserMock.parse(null, anyString(), 'the content\n'.length, 'more content'.length)).return([ null, null, ]).once()

		const marmdown = new Marmdown('the content\nmore content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(firstTextParserMock)
		verify(secondTextParserMock)
	})
	it('passes third line to first and second parser again to ensure that it does not stop parsing after finding a previous match', () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
		const previousContent = new UpdatableTestContent()
		when(secondTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([previousContent, new ParsedTestContent(0, 'the content'.length, []), ])
		when(secondTextParserMock.parse(previousContent, anyString(), 'the content\n'.length, 'more content'.length)).return([previousContent, new ParsedTestContent(12, 'more content'.length, []), ]).once()
		when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([null, null, ]).anyTimes()
		when(firstTextParserMock.parse(null, anyString(), 'the content\nmore content\n'.length, 'third line'.length)).return([null, null, ]).once()
		when(secondTextParserMock.parse(null, anyString(), 'the content\nmore content\n'.length, 'third line'.length)).return([null, null, ]).once()
		when(secondTextParserMock.parse(anything(), anyString(), 'the content\nmore content\n'.length, 'third line'.length)).return([null, null, ]).anyTimes()

		const marmdown = new Marmdown('the content\nmore content\nthird line', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(firstTextParserMock)
		verify(secondTextParserMock)
	})

	const emptyLines = [ '\n', '\r\n', '   \r', '\t   \r\n', ]
	emptyLines.forEach(el => it(`does not pass second line to previous parser first when ther was empty line "${el.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')}" -- it ENDS the block`, () => {
		const optionsParserMock = mock<OptionsParser>('optionsParserMock')
		when(optionsParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null])

		const firstTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser<unknown, TestContent, ParsedTestContent>>('secondTextParserMock')
		const previousContent = new UpdatableTestContent()
		when(secondTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([previousContent, new ParsedTestContent(0, 'the content'.length, []), ])
		when(firstTextParserMock.parse(null, anyString(), `the content\n${el}`.length, 'more content'.length)).return([previousContent, new ParsedTestContent(`the content\n${el}`.length, 'more content'.length, []), ]).once()
		when(secondTextParserMock.parse(previousContent, anyString(), anyNumber(), anyNumber())).return([null, null, ]).never()
		when(firstTextParserMock.parse(null, anyString(), 0, 'the content'.length)).return([null, null, ]).anyTimes()
		when(firstTextParserMock.parse(anything(), anyString(), anyNumber(), anyNumber())).return([null, null, ]).never()

		const marmdown = new Marmdown(`the content\n${el}more content`, new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
			'two': instance(secondTextParserMock),
		}, [ 'one', 'two' ]))

		verify(firstTextParserMock)
		verify(secondTextParserMock)
	}))

})

/*


	


	it.skip('adds parsed content to document content', () => {
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const parsedContent = new UpdatableHeading(1, new UpdatableOptions([], -1), ['12'], 1, undefined)
		const firstTextParserMock = mock<TextParser<UpdatableHeading>>('firstTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return(parsedContent)
		when(firstTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null)

		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
			'one': instance(firstTextParserMock),
		}, [ 'one' ]))

		expect(marmdown.document.content).toContain(parsedContent)
	})

	it.skip('parses document options first', () => {
		const expectedOptions = new UpdatableOptions([ new UpdatableOption('foo=bar', 'foo', 'bar', -1, -1, new OptionParser(new TestParsers({}, []))) ], -1)
		const optionsParserMock = mock<TextParser<Options>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(expectedOptions)

		const marmdown = new Marmdown('the content', new TestParsers({
			'OptionsParser': instance(optionsParserMock),
		}, []))

		expect(marmdown.document.options).toEqual(expectedOptions)
	})
})
*/
