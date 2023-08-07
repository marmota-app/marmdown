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
import { MfMLinkText } from "$mfm/inline/link/MfMLinkText"
import { createLinkTextParser } from "./createLinkParser"

describe('MfMLinkText', () => {
	describe('parsing the content', () => {
		it('parses empty link text', () => {
			const { linkTextParser } = createLinkTextParser()
			const text = 'text before []'

			const result = linkTextParser.parseLine(null, text, 'text before ['.length, text.length-'text before ['.length)

			expect(result).toHaveProperty('type', 'link-text')
			expect(result?.content).toHaveLength(0)

			expect(result?.lines[0].asText).toEqual('')
		})

		it('parses nested link text content', () => {
			const { linkTextParser } = createLinkTextParser()
			const text = 'link with **bold** text]'

			const result = linkTextParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-text')
			expect(result?.content).toHaveLength(3)

			expect(result?.content[0]).toHaveProperty('text', 'link with ')
			expect(result?.content[1]).toHaveProperty('type', 'strong')
			expect(result?.content[1].content[0]).toHaveProperty('text', 'bold')
			expect(result?.content[2]).toHaveProperty('text', ' text')

			expect(result?.lines[0].asText).toEqual('link with **bold** text')
		})
	})
	describe('parsing updates', () => {
		it('parses update to the text', () => {
			const { linkTextParser, idGenerator } = createLinkTextParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = 'link with **bold** text]'

			const intermediate = linkTextParser.parseLine(null, text, 0, text.length) as MfMLinkText
			const result = updateParser.parse(intermediate, { text: 'some ', rangeOffset: 'link with '.length, rangeLength: 0}) as MfMLinkText

			expect(result?.content).toHaveLength(3)

			expect(result?.content[0]).toHaveProperty('text', 'link with some ')
			expect(result?.content[1]).toHaveProperty('type', 'strong')
			expect(result?.content[1].content[0]).toHaveProperty('text', 'bold')
			expect(result?.content[2]).toHaveProperty('text', ' text')

			expect(result?.lines[0].asText).toEqual('link with some **bold** text')
		});

		['[', ']'].forEach(special => it(`does not parse update when the inserted string contains "${special}"`, () => {
			const { linkTextParser, idGenerator } = createLinkTextParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = 'link with **bold** text]'

			const intermediate = linkTextParser.parseLine(null, text, 0, text.length) as MfMLinkText
			const result = updateParser.parse(intermediate, { text: special, rangeOffset: 'link with '.length, rangeLength: 0}) as MfMLinkText

			expect(result).toBeNull()
		}))
	})
})
