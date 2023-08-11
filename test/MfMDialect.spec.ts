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
import { LineByLineParser } from "$markdown/LineByLineParser"
import { MfMDialect } from "$markdown/MfMDialect"
import { UpdateParser } from "$markdown/UpdateParser"
import { MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMContainer, MfMContainerParser } from "$mfm/MfMContainer"
import { MfMParsers } from "$mfm/MfMParsers"
import { anyObject, anyString, instance, mock, when } from "omnimock"

describe('MfMDialect', () => {
	const sectionParserMock = mock(MfMSectionParser)
	it('creates two empty documents with different ids', () => {
		const dialect = new MfMDialect()

		const d1 = dialect.createEmptyDocument()
		const d2 = dialect.createEmptyDocument()

		expect(d1.id).not.toEqual(d2.id)
	})

	it('uses the line-by-line-parser to parse a document', () => {
		const containerParserMock = mock(MfMContainerParser)
		const expectedDocument = new MfMContainer('expected-id', instance(containerParserMock), instance(sectionParserMock))
		const lblParserMock = mock<LineByLineParser<MfMContainer>>(LineByLineParser)
		when(lblParserMock.parse(anyString())).return(expectedDocument)
		const updateParserMock = mock(UpdateParser)

		const idg = new NumberedIdGenerator()
		const dialect = new MfMDialect({}, idg, new MfMParsers(idg, {}), instance(lblParserMock))
		const doc = dialect.parseCompleteText('dummy text')

		expect(doc).toEqual(expectedDocument)
	})

	it('uses update-parser to parse a document update', () => {
		const containerParserMock = mock(MfMContainerParser)
		const currentDocument = new MfMContainer('expected-id', instance(containerParserMock), instance(sectionParserMock))
		const expectedDocument = new MfMContainer('expected-id', instance(containerParserMock), instance(sectionParserMock))

		const lblParserMock = mock<LineByLineParser<MfMContainer>>(LineByLineParser)
		const updateParserMock = mock<UpdateParser<MfMContainer>>(UpdateParser)
		when(updateParserMock.parse(currentDocument, anyObject())).return(expectedDocument)

		const idg = new NumberedIdGenerator()
		const dialect = new MfMDialect({}, idg, new MfMParsers(idg, {}), instance(lblParserMock), instance(updateParserMock))

		const doc = dialect.parseUpdate(currentDocument, { text: 'dummy', rangeOffset: 2, rangeLength: 3, })

		expect(doc).toEqual(expectedDocument)
	})
})
