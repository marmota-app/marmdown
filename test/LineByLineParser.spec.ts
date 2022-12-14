import { LineByLineParser, ParseError } from "$markdown/LineByLineParser"
import { MfMContainer, MfMContainerParser } from "$mfm/MfMContainer"
import { Parser } from "$parser/Parser"
import { instance, mock, verify, when } from "omnimock"

describe('LineByLineParser', () => {
	it('passes the complete document to the given parser when there are no lines', () => {
		const containerParserMock = mock(MfMContainerParser)
		when(containerParserMock.parseLine(null, 'the text', 0, 'the text'.length))
			.return(new MfMContainer('expected result'))
			.once()

		const parser = new LineByLineParser(instance(containerParserMock))
		parser.parse('the text')

		verify(containerParserMock)
	})
	it('passes both lines and the previous content to the container parser mock', () => {
		const text = 'Sphinx of black quartz,\njudge my vow.'

		const containerParserMock = mock(MfMContainerParser)
		const container = new MfMContainer('expected result')
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length))
			.return(container)
			.once()
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length))
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
		const container = new MfMContainer('a container')
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length))
			.return(container)
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length))
			.return(null)

		const parser = new LineByLineParser(instance(containerParserMock))
		expect(() => parser.parse(text)).toThrow(ParseError)
	})
	it('throws an error if a line in the middle suddenly returns a different container', () => {
		const text = 'Sphinx of black quartz,\njudge my vow.'

		const containerParserMock = mock(MfMContainerParser)
		const container = new MfMContainer('a container')
		when(containerParserMock.parseLine(null, text, 0, 'Sphinx of black quartz,'.length))
			.return(container)
		when(containerParserMock.parseLine(container, text, 'Sphinx of black quartz,\n'.length, 'judge my vow.'.length))
			.return(new MfMContainer('different container'))

		const parser = new LineByLineParser(instance(containerParserMock))
		expect(() => parser.parse(text)).toThrow(ParseError)
	})
})
