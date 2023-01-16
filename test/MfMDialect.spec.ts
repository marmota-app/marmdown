import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { LineByLineParser } from "$markdown/LineByLineParser"
import { MfMDialect } from "$markdown/MfMDialect"
import { UpdateParser } from "$markdown/UpdateParser"
import { MfMContainer, MfMContainerParser } from "$mfm/MfMContainer"
import { MfMParsers } from "$mfm/MfMParsers"
import { anyObject, anyString, instance, mock, when } from "omnimock"

describe('MfMDialect', () => {
	it('creates two empty documents with different ids', () => {
		const dialect = new MfMDialect()

		const d1 = dialect.createEmptyDocument()
		const d2 = dialect.createEmptyDocument()

		expect(d1.id).not.toEqual(d2.id)
	})

	it('uses the line-by-line-parser to parse a document', () => {
		const containerParserMock = mock(MfMContainerParser)
		const expectedDocument = new MfMContainer('expected-id', instance(containerParserMock))
		const lblParserMock = mock<LineByLineParser<MfMContainer>>(LineByLineParser)
		when(lblParserMock.parse(anyString())).return(expectedDocument)
		const updateParserMock = mock(UpdateParser)

		const idg = new NumberedIdGenerator()
		const dialect = new MfMDialect(idg, new MfMParsers(idg), instance(lblParserMock))
		const doc = dialect.parseCompleteText('dummy text')

		expect(doc).toEqual(expectedDocument)
	})

	it('uses update-parser to parse a document update', () => {
		const containerParserMock = mock(MfMContainerParser)
		const currentDocument = new MfMContainer('expected-id', instance(containerParserMock))
		const expectedDocument = new MfMContainer('expected-id', instance(containerParserMock))

		const lblParserMock = mock<LineByLineParser<MfMContainer>>(LineByLineParser)
		const updateParserMock = mock<UpdateParser<MfMContainer>>(UpdateParser)
		when(updateParserMock.parse(currentDocument, anyObject())).return(expectedDocument)

		const idg = new NumberedIdGenerator()
		const dialect = new MfMDialect(idg, new MfMParsers(idg), instance(lblParserMock), instance(updateParserMock))

		const doc = dialect.parseUpdate(currentDocument, { text: 'dummy', rangeOffset: 2, rangeLength: 3, })

		expect(doc).toEqual(expectedDocument)
	})
})
