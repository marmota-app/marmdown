import { mock, instance, when, verify, anyString, anyNumber, } from 'omnimock'

import { Marmdown } from "$markdown/Marmdown"
import { TextParser } from "$markdown/parser/TextParser"
import { DefaultContent, Empty } from '$markdown/MarkdownDocument'
import { ContentOptions } from '$markdown/MarkdownOptions'

describe('Marmdown', () => {
	it('can supply a non-null markdown document', () => {
		const marmdown = new Marmdown('')

		expect(marmdown.document).not.toBeNull()
	})

	it('passes content to first subparser', () => {
		const optionsParserMock = mock<TextParser<ContentOptions>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return(null).once()

		const subparsers: TextParser[] = [ instance(firstTextParserMock), ]
		const marmdown = new Marmdown('the content', instance(optionsParserMock), subparsers)

		verify(firstTextParserMock)
	})

	it('passes content to next subparser when pervious subparser returns null', () => {
		const optionsParserMock = mock<TextParser<ContentOptions>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser>('secondTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return(null)
		when(secondTextParserMock.parse('the content', 0, 'the content'.length)).return(null).once()

		const subparsers: TextParser[] = [ instance(firstTextParserMock), instance(secondTextParserMock), ]
		const marmdown = new Marmdown('the content', instance(optionsParserMock), subparsers)

		verify(secondTextParserMock)
	})

	it('passes new start index to first subparser when pervious subparser returns result', () => {
		const optionsParserMock = mock<TextParser<ContentOptions>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		const secondTextParserMock = mock<TextParser>('secondTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return({
			startIndex: 1,
			length: 2,
			content: { type: 'Empty', hasChanged: true, },
		})
		when(firstTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null).once()
		when(secondTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null).once()

		const subparsers: TextParser[] = [ instance(firstTextParserMock), instance(secondTextParserMock), ]
		const marmdown = new Marmdown('the content', instance(optionsParserMock), subparsers)

		verify(firstTextParserMock)
		verify(secondTextParserMock)
	})

	it('adds parsed content to document content', () => {
		const optionsParserMock = mock<TextParser<ContentOptions>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return(null)

		const parsedContent: Empty&DefaultContent = { type: 'Empty', hasChanged: true, }
		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		when(firstTextParserMock.parse('the content', 0, 'the content'.length)).return({
			startIndex: 1,
			length: 2,
			content: parsedContent,
		})
		when(firstTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null)

		const subparsers: TextParser[] = [ instance(firstTextParserMock), ]
		const marmdown = new Marmdown('the content', instance(optionsParserMock), subparsers)

		expect(marmdown.document.content).toContain(parsedContent)
	})

	it('parses document options first', () => {
		const expectedOptions = { foo: 'bar', }
		const optionsParserMock = mock<TextParser<ContentOptions>>('optionsParserMock')
		when(optionsParserMock.parse(anyString(), anyNumber(), anyNumber())).return({
			startIndex: 1,
			length: 2,
			content: expectedOptions,
		})

		const firstTextParserMock = mock<TextParser>('firstTextParserMock')
		when(firstTextParserMock.parse('the content', 3, 'the content'.length-3)).return(null).once()

		const subparsers: TextParser[] = [ instance(firstTextParserMock), ]
		const marmdown = new Marmdown('the content', instance(optionsParserMock), subparsers)

		expect(marmdown.document.options).toEqual(expectedOptions)
	})
})