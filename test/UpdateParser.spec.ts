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

import { NumberedIdGenerator } from "../src/IdGenerator"
import { UpdateParser } from "../src/UpdateParser"
import { MfMSectionParser } from "../src/mfm/block/MfMSection"
import { MfMContentLine, MfMContentLineParser } from "../src/mfm/inline/MfMContentLine"
import { MfMText, MfMTextParser } from "../src/mfm/inline/MfMText"
import { MfMContainer, MfMContainerParser } from "../src/mfm/MfMContainer"
import { instance, mock } from "omnimock"
import { createLinkParser } from "./mfm/inline/link/createLinkParser"
import { MfMLink } from "../src/mfm/inline/link/MfMLink"
import { MfMLinkText } from "../src/mfm/inline/link/MfMLinkText"
import { MfMLinkDestination } from "../src/mfm/inline/link/MfMLinkDestination"
import { MfMLinkTitle } from "../src/mfm/inline/link/MfMLinkTitle"

describe('UpdateParser', () => {
	[ '\r', '\n' ].forEach(nl => it(`does not parse a document that contains the newline character ${nl.replaceAll('\r', '\\r').replaceAll('\n', '\\n')}`, () => {
		const updateParser = new UpdateParser(new NumberedIdGenerator())
		const containerParserMock = mock(MfMContainerParser)
		const sectionParserMock = mock(MfMSectionParser)
		const dummy = new MfMContainer('dummy', instance(containerParserMock), instance(sectionParserMock))

		const result = updateParser.parse(dummy, { text: `foo${nl}bar`, rangeOffset: 0, rangeLength: 0, })

		expect(result).toEqual(null)
	}))

	it('changes the id of the updated element (and only that!) when it actually updates it', () => {
		const idGenerator = new NumberedIdGenerator()
		const MfMText = new MfMTextParser({ idGenerator, })
		const contentLineParser = new MfMContentLineParser({ idGenerator, MfMText, allInlines: [ MfMText, ], })
		const updateParser = new UpdateParser(idGenerator)

		const text = contentLineParser.parseLine(null, 'hello world', 0, 'hello world'.length) as MfMContentLine
		const originalId = text.id
		const originalInnerId = text.content[0].id
		const updatedText = updateParser.parse(text, { text: 'o hi', rangeOffset: 0, rangeLength: 'hello'.length, }) as MfMContentLine

		expect(updatedText.content).toHaveLength(1)
		expect(updatedText.content[0].type).toEqual('text')
		expect((updatedText.content[0] as MfMText).text).toEqual('o hi world')
		expect(updatedText.content[0].id).not.toEqual(originalInnerId)

		expect(updatedText.id).toEqual(originalId)
	})

	describe('notifying listeners about elements where children did change', () => {
		function setup() {
			const changedChildren: string[] = []
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const text = '[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_](<destination> "title")'
			const link = linkParser.parseLine(null, text, 0, text.length) as MfMLink
	
			const linkText = link.content[0] as MfMLinkText
			const linkDestination = link.content[1] as MfMLinkDestination
			const linkTitle = link.content[2] as MfMLinkTitle
	
			const strong = linkText.content[1]
			const emphazised = linkText.content[3]
	
			link.childrenChanged = () => changedChildren.push('link')
			linkText.childrenChanged = () => changedChildren.push('text')
			linkDestination.childrenChanged = () => changedChildren.push('destination')
			linkTitle.childrenChanged = () => changedChildren.push('title')

			strong.childrenChanged = () => changedChildren.push('strong')
			strong.content[1].childrenChanged = () => changedChildren.push('strong->em')
			strong.content[3].childrenChanged = () => changedChildren.push('strong->st')

			emphazised.childrenChanged = () => changedChildren.push('emphazised')
			emphazised.content[1].childrenChanged = () => changedChildren.push('emphazised->strong')
			emphazised.content[1].content[1].childrenChanged = () => changedChildren.push('emphazised->strong->st')

			return { link, changedChildren, updateParser }
		}

		const testCases: [number, string][] = [
			[ '[this'.length, 'text' ],
			[ '[this is **a'.length, 'strong' ],
			[ '[this is **a link _w'.length, 'strong->em' ],
			[ '[this is **a link _with_ ~'.length, 'strong->st' ],
			[ '[this is **a link _with_ ~nested~** '.length, 'text' ],
			[ '[this is **a link _with_ ~nested~** elements _that'.length, 'emphazised' ],
			[ '[this is **a link _with_ ~nested~** elements _that **mu'.length, 'emphazised->strong' ],
			[ '[this is **a link _with_ ~nested~** elements _that **must ~b'.length, 'emphazised->strong->st' ],
			[ '[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_](<de'.length, 'link' ],
			[ '[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_](<destination> "tit'.length, 'link' ],
		]
		testCases.forEach(([updateAt, updated]) => it(`updates "${updated}" when text is inserted at ${updateAt}`, () => {
			const { link, changedChildren, updateParser } = setup()
			const updatedLink = updateParser.parse(link, { text: 'i', rangeOffset: updateAt, rangeLength: 0 }) as MfMLink

			expect(updatedLink).not.toBeNull()
			expect(changedChildren).toHaveLength(1)
			expect(changedChildren[0]).toEqual(updated)
		}))
	})

	describe('changes the start index of all following elements', () => {
		it('updates the start index after adding text', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const text = '[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_](<>)'
			const link = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(link, { text: ' updated', rangeLength: 0, rangeOffset: '[this is **a link _with'.length}) as MfMLink

			expect(updated).not.toBeNull()
			expect(updated.lines[0].start).toEqual(0)
			const linkText = updated.content[0] as MfMLinkText
			const linkDestination = updated.content[1] as MfMLinkDestination

			expect(linkText.lines[0].start).toEqual(1)
			expect(linkText.lines[0].length).toEqual('this is **a link _with updated_ ~nested~** elements _that **must ~be~** updated_'.length)
			expect(linkText.content[0].lines[0].start).toEqual(1)
			
			const strong = linkText.content[1]
			expect(strong.lines[0].start).toEqual('[this is '.length)
			expect(strong.content[0].lines[0].start).toEqual('[this is **'.length)
			expect(strong.content[1].lines[0].start).toEqual('[this is **a link '.length)
			expect(strong.content[1].content[0].lines[0].start).toEqual('[this is **a link _'.length)
			expect(strong.content[1].content[0].lines[0].length).toEqual('with updated'.length)
			expect(strong.content[2].lines[0].start).toEqual('[this is **a link _with updated_'.length)
			expect(strong.content[3].lines[0].start).toEqual('[this is **a link _with updated_ '.length)
			expect(strong.content[3].content[0].lines[0].start).toEqual('[this is **a link _with updated_ ~'.length)

			expect(linkText.content[2].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~**'.length)
			
			const emphazised = linkText.content[3]
			expect(emphazised.lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements '.length)
			expect(emphazised.content[0].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _'.length)
			expect(emphazised.content[1].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _that '.length)
			expect(emphazised.content[1].content[0].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _that **'.length)
			expect(emphazised.content[1].content[1].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _that **must '.length)
			expect(emphazised.content[1].content[1].content[0].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _that **must ~'.length)
			expect(emphazised.content[2].lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _that **must ~be~**'.length)
			
			expect(linkDestination.lines[0].start).toEqual('[this is **a link _with updated_ ~nested~** elements _that **must ~be~** updated_]('.length)
		})

		it('updates the start index after removing text', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const text = '[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_](<>)'
			const link = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(link, { text: '', rangeLength: 1, rangeOffset: '[this is **a l'.length}) as MfMLink

			expect(updated).not.toBeNull()
			expect(updated.lines[0].start).toEqual(0)
			const linkText = updated.content[0] as MfMLinkText
			const linkDestination = updated.content[1] as MfMLinkDestination

			expect(linkText.lines[0].start).toEqual(1)
			expect(linkText.lines[0].length).toEqual('this is **a lnk _with_ ~nested~** elements _that **must ~be~** updated_'.length)
			expect(linkText.content[0].lines[0].start).toEqual(1)
			
			const strong = linkText.content[1]
			expect(strong.lines[0].start).toEqual('[this is '.length)
			expect(strong.content[0].lines[0].start).toEqual('[this is **'.length)
			expect(strong.content[1].lines[0].start).toEqual('[this is **a lnk '.length)
			expect(strong.content[1].content[0].lines[0].start).toEqual('[this is **a lnk _'.length)
			expect(strong.content[1].content[0].lines[0].length).toEqual('with'.length)
			expect(strong.content[2].lines[0].start).toEqual('[this is **a lnk _with_'.length)
			expect(strong.content[3].lines[0].start).toEqual('[this is **a lnk _with_ '.length)
			expect(strong.content[3].content[0].lines[0].start).toEqual('[this is **a lnk _with_ ~'.length)

			expect(linkText.content[2].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~**'.length)
			
			const emphazised = linkText.content[3]
			expect(emphazised.lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements '.length)
			expect(emphazised.content[0].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _'.length)
			expect(emphazised.content[1].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _that '.length)
			expect(emphazised.content[1].content[0].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _that **'.length)
			expect(emphazised.content[1].content[1].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _that **must '.length)
			expect(emphazised.content[1].content[1].content[0].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _that **must ~'.length)
			expect(emphazised.content[2].lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _that **must ~be~**'.length)
			
			expect(linkDestination.lines[0].start).toEqual('[this is **a lnk _with_ ~nested~** elements _that **must ~be~** updated_]('.length)
		})

		it('updates the start index after changing text', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
	
			const text = '[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_](<>)'
			const link = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(link, { text: '1', rangeLength: 1, rangeOffset: '[this is **a l'.length}) as MfMLink

			expect(updated).not.toBeNull()
			expect(updated.lines[0].start).toEqual(0)
			const linkText = updated.content[0] as MfMLinkText
			const linkDestination = updated.content[1] as MfMLinkDestination

			expect(linkText.lines[0].start).toEqual(1)
			expect(linkText.lines[0].length).toEqual('this is **a link _with_ ~nested~** elements _that **must ~be~** updated_'.length)
			expect(linkText.content[0].lines[0].start).toEqual(1)
			
			const strong = linkText.content[1]
			expect(strong.lines[0].start).toEqual('[this is '.length)
			expect(strong.content[0].lines[0].start).toEqual('[this is **'.length)
			expect(strong.content[1].lines[0].start).toEqual('[this is **a link '.length)
			expect(strong.content[1].content[0].lines[0].start).toEqual('[this is **a link _'.length)
			expect(strong.content[1].content[0].lines[0].length).toEqual('with'.length)
			expect(strong.content[2].lines[0].start).toEqual('[this is **a link _with_'.length)
			expect(strong.content[3].lines[0].start).toEqual('[this is **a link _with_ '.length)
			expect(strong.content[3].content[0].lines[0].start).toEqual('[this is **a link _with_ ~'.length)

			expect(linkText.content[2].lines[0].start).toEqual('[this is **a link _with_ ~nested~**'.length)
			
			const emphazised = linkText.content[3]
			expect(emphazised.lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements '.length)
			expect(emphazised.content[0].lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _'.length)
			expect(emphazised.content[1].lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _that '.length)
			expect(emphazised.content[1].content[0].lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _that **'.length)
			expect(emphazised.content[1].content[1].lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _that **must '.length)
			expect(emphazised.content[1].content[1].content[0].lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _that **must ~'.length)
			expect(emphazised.content[2].lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _that **must ~be~**'.length)
			
			expect(linkDestination.lines[0].start).toEqual('[this is **a link _with_ ~nested~** elements _that **must ~be~** updated_]('.length)
		})
	})
})
