import { UpdateParser } from "$markdown/UpdateParser"
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

	it.skip('changes the id of the updated element when it actually updates it', () => {
		expect(true).toEqual(false)
	})
})
