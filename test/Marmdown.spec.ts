/*
Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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

import { Marmdown } from "../src/Marmdown"
import { mock, instance, when, anyObject } from 'omnimock'
import { ContainerBlock, } from "$markdown/element/Element"
import { ContentUpdate } from "$markdown/ContentUpdate"
import { Dialect } from "$parser/Dialect"
import { MfMDialect } from "$markdown/MfMDialect"
import { GenericBlock } from "$element/GenericElement"

class TestContainer extends GenericBlock<TestContainer, unknown, string> {}
class TestDialect implements Dialect<TestContainer> {
	createEmptyDocument(): TestContainer {
		return new TestContainer('dummy', 'container')
	}
	parseCompleteText(text: string): TestContainer {
		return new TestContainer('dummy', 'container')
	}
	parseUpdate(document: TestContainer, update: ContentUpdate): TestContainer | null {
		return document
	}
}
describe('Marmdown', () => {
	it('contains an empty document when freshly created', () => {
		const marmdown = new Marmdown(new TestDialect())

		expect(marmdown.document?.content).toHaveLength(0)
	})

	it('parses the whole document when setting new text content', () => {
		const expectedDocument = new TestContainer('dummy', 'expected')
		const dialectMock = mock(TestDialect)
		when(dialectMock.createEmptyDocument()).return(new TestContainer('dummy', 'dummy'))
		when(dialectMock.parseCompleteText('the text content')).return(expectedDocument)

		const marmdown = new Marmdown(instance(dialectMock))
		marmdown.textContent = 'the text content'

		expect(marmdown.document).toEqual(expectedDocument)
	})

	it('recreates the document text from the stored document structure (does NOT return the original text)', () => {
		const expectedText = 'some updated text'
		const documentMock = mock(TestContainer)
		when(documentMock.asText).return(expectedText)
		const dialectMock = mock(TestDialect)
		when(dialectMock.createEmptyDocument()).return(new TestContainer('dummy', 'dummy'))
		when(dialectMock.parseCompleteText('the text content')).return(instance(documentMock))

		const marmdown = new Marmdown(instance(dialectMock))
		marmdown.textContent = 'the text content'

		expect(marmdown.textContent).toEqual(expectedText)
	})

	it('parses an update to the document', () => {
		const expectedChange: ContentUpdate = { rangeOffset: 5, rangeLength: 7, text: 'foobar', }

		const expectedDocument = new TestContainer('dummy', 'expected')
		const dialectMock = mock(TestDialect)
		when(dialectMock.createEmptyDocument()).return(new TestContainer('dummy', 'dummy'))
		when(dialectMock.parseUpdate(anyObject(), expectedChange)).return(null)
		when(dialectMock.parseCompleteText('the text content')).return(expectedDocument)

		const marmdown = new Marmdown(instance(dialectMock))
		marmdown.update(expectedChange, () => 'the text content')

		expect(marmdown.document).toEqual(expectedDocument)
	})

	it('parses the complete document when parsing an update did bail out', () => {
		const expectedChange: ContentUpdate = { rangeOffset: 5, rangeLength: 7, text: 'foobar', }

		const expectedDocument = new TestContainer('dummy', 'expected')
		const dialectMock = mock(TestDialect)
		when(dialectMock.createEmptyDocument()).return(new TestContainer('dummy', 'dummy'))
		when(dialectMock.parseUpdate(anyObject(), expectedChange)).return(expectedDocument)

		const marmdown = new Marmdown(instance(dialectMock))
		marmdown.update(expectedChange, () => '')

		expect(marmdown.document).toEqual(expectedDocument)
	})
})
