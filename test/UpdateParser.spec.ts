import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { UpdateParser } from "$markdown/UpdateParser"
import { MfMHeadingText, MfMHeadingTextParser } from "$mfm/block/MfMHeading"
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
import { MfMContainer, MfMContainerParser } from "$mfm/MfMContainer"
import { instance, mock } from "omnimock"

describe('UpdateParser', () => {
	[ '\r', '\n' ].forEach(nl => it(`does not parse a document that contains the newline character ${nl.replaceAll('\r', '\\r').replaceAll('\n', '\\n')}`, () => {
		const updateParser = new UpdateParser()
		const containerParserMock = mock(MfMContainerParser)
		const dummy = new MfMContainer('dummy', instance(containerParserMock))

		const result = updateParser.parse(dummy, { text: `foo${nl}bar`, rangeOffset: 0, rangeLength: 0, })

		expect(result).toEqual(null)
	}))

	it('changes the id of the updated element (and only that!) when it actually updates it', () => {
		const idGenerator = new NumberedIdGenerator()
		const textParser = new MfMHeadingTextParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator, }), ], })
		const updateParser = new UpdateParser(idGenerator)

		const text = textParser.parseLine(null, 'hello world', 0, 'hello world'.length) as MfMHeadingText
		const originalId = text.id
		const originalInnerId = text.content[0].id
		const updatedText = updateParser.parse(text, { text: 'o hi', rangeOffset: 0, rangeLength: 'hello'.length, }) as MfMHeadingText

		expect(updatedText.content).toHaveLength(1)
		expect(updatedText.content[0].type).toEqual('text')
		expect((updatedText.content[0] as MfMText).text).toEqual('o hi world')
		expect(updatedText.content[0].id).not.toEqual(originalInnerId)

		expect(updatedText.id).toEqual(originalId)
	})
})
