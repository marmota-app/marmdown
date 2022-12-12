import { Marmdown } from "../src/Marmdown"
import { mock, instance, when } from 'omnimock'
import { Parsers } from "$markdown/MarmdownParsers"
import { ContainerBlock, } from "$markdown/element/Element"

describe('Marmdown', () => {
	it('contains an empty document when freshly created', () => {
		const marmdown = new Marmdown()

		expect(marmdown.document).toHaveLength(0)
	})

	it('parses the whole document when setting new text content', () => {
		const expectedDocument: ContainerBlock[] = [ new ContainerBlock('dummy', 'dummy') ]
		const parsersMock = mock<Parsers>('parsersMock')
		when(parsersMock.parseCompleteText('the text content')).return(expectedDocument)

		const marmdown = new Marmdown(instance(parsersMock))
		marmdown.textContent = 'the text content'

		expect(marmdown.document).toEqual(expectedDocument)
	})
})
