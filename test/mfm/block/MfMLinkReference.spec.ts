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

import { UpdateParser } from "$markdown/UpdateParser"
import { MfMLinkReference } from "$mfm/block/MfMLinkReference"
import { createLinkReferenceParser } from "../inline/link/createLinkParser"

describe('MfMLinkReference', () => {
	describe('parsing the content', () => {
		it('parses a link reference with only text and url', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text]: link_destination   \t '

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)

			expect(result).toHaveProperty('type', 'link-reference')
			expect(result?.text?.content).toHaveLength(1)
			expect(result?.text?.content[0]).toHaveProperty('text', 'link text')
			expect(result?.destination).toHaveProperty('target', 'link_destination')
			expect(result?.title).toBeUndefined()

			expect(result?.lines[0]).toHaveProperty('asText', '[link text]: link_destination   \t ')
		})
		it('parses a complete link reference', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text]: link_destination "link title"  \t '

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)

			expect(result).toHaveProperty('type', 'link-reference')
			expect(result?.text?.content).toHaveLength(1)
			expect(result?.text?.content[0]).toHaveProperty('text', 'link text')
			expect(result?.destination).toHaveProperty('target', 'link_destination')
			expect(result?.title).toHaveProperty('value', 'link title')

			expect(result?.lines[0]).toHaveProperty('asText', '[link text]: link_destination "link title"  \t ')
		})
		it('collapses whitespace between elements', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text]: \t   link_destination\t\t \t\t"link title"  \t '

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)

			expect(result).toHaveProperty('type', 'link-reference')
			expect(result?.text?.content).toHaveLength(1)
			expect(result?.text?.content[0]).toHaveProperty('text', 'link text')
			expect(result?.destination).toHaveProperty('target', 'link_destination')
			expect(result?.title).toHaveProperty('value', 'link title')

			expect(result?.lines[0]).toHaveProperty('asText', '[link text]: \t   link_destination\t\t \t\t"link title"  \t ')
		})

		it('does not parse link reference with characters after the title', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text]: \t   link_destination\t\t \t\t"link title"  \t invalid text'

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)
			expect(result).toBeNull()
		})
		it('does not parse link reference that is missing the closing bracket', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text: \t   link_destination\t\t \t\t"link title"'

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)
			expect(result).toBeNull()
		})
		it('does not parse link reference that is missing the colon', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text] \t   link_destination\t\t \t\t"link title"'

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)
			expect(result).toBeNull()
		})
		it('does not parse link reference that is missing the url', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n[link text]:'

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)
			expect(result).toBeNull()
		})

		it('parses link reference indented by three spaces', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n   [link text]: link_destination   \t '

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)

			expect(result).toHaveProperty('type', 'link-reference')
			expect(result?.text?.content).toHaveLength(1)
			expect(result?.text?.content[0]).toHaveProperty('text', 'link text')
			expect(result?.destination).toHaveProperty('target', 'link_destination')
			expect(result?.title).toBeUndefined()

			expect(result?.lines[0]).toHaveProperty('asText', '   [link text]: link_destination   \t ')
		})
		it('does not parse link reference indented by four spaces', () => {
			const { linkReferenceParser } = createLinkReferenceParser()
			const text = 'text before\n    [link text]: link_destination   \t '

			const result = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length)

			expect(result).toBeNull()
		})
	})
	describe('parsing updates', () => {
		it('never parses update to a link reference, which must always re-parse the document!', () => {
			const { linkReferenceParser, idGenerator } = createLinkReferenceParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = 'text before\n[link text]: \t   link_destination\t\t \t\t"link title"  \t '

			const original = linkReferenceParser.parseLine(null, text, 'text before\n'.length, text.length-'text before\n'.length) as MfMLinkReference
			const result = updateParser.parse(original, { text: 'updated ', rangeOffset: 'text before\n['.length, rangeLength: 0 }) as MfMLinkReference

			expect(result).toBeNull()
		})
	})
})
