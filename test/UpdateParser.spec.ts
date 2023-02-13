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

import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { UpdateParser } from "$markdown/UpdateParser"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
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
		const textParser = new MfMContentLineParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator, }), ], })
		const updateParser = new UpdateParser(idGenerator)

		const text = textParser.parseLine(null, 'hello world', 0, 'hello world'.length) as MfMContentLine
		const originalId = text.id
		const originalInnerId = text.content[0].id
		const updatedText = updateParser.parse(text, { text: 'o hi', rangeOffset: 0, rangeLength: 'hello'.length, }) as MfMContentLine

		expect(updatedText.content).toHaveLength(1)
		expect(updatedText.content[0].type).toEqual('text')
		expect((updatedText.content[0] as MfMText).text).toEqual('o hi world')
		expect(updatedText.content[0].id).not.toEqual(originalInnerId)

		expect(updatedText.id).toEqual(originalId)
	})
})
