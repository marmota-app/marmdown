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

import { UpdateParser } from "../../../../src/UpdateParser"
import { MfMLinkTitle } from "../../../../src/mfm/inline/link/MfMLinkTitle"
import { createLinkTitleParser } from "./createLinkParser"

describe('MfMLinkTitle', () => {
	const delimiters: [string, string][] = [['"', '"'], ["'", "'"], ['(', ')']]
	delimiters.forEach(([start, end]) => describe(`parsing the content between ../../../../src/{start} and ../../../../src/{end}`, () => {
		it(`parses empty title ../../../../src/{start}../../../../src/{end}`, () => {
			const { linkTitleParser } = createLinkTitleParser()
			const text = `text before ../../../../src/{start}../../../../src/{end}`

			const result = linkTitleParser.parseLine(null, text, 'text before '.length, text.length-'text before '.length)
			expect(result).toHaveProperty('type', 'link-title')
			expect(result?.value).toEqual('')
			
			expect(result?.lines[0]).toHaveProperty('asText', `../../../../src/{start}../../../../src/{end}`)
		})

		it(`parses link title text between ../../../../src/{start} and ../../../../src/{end}`, () => {
			const { linkTitleParser } = createLinkTitleParser()
			const text = `../../../../src/{start}the link title../../../../src/{end} text after link ../../../../src/{end}`

			const result = linkTitleParser.parseLine(null, text, 0, text.length)
			expect(result).toHaveProperty('type', 'link-title')
			expect(result?.value).toEqual('the link title')
			
			expect(result?.lines[0]).toHaveProperty('asText', `../../../../src/{start}the link title../../../../src/{end}`)
		})

		it(`does not parse link text when opening ../../../../src/{start} is missing`, () => {
			const { linkTitleParser } = createLinkTitleParser()
			const text = `the link title../../../../src/{end}`

			const result = linkTitleParser.parseLine(null, text, 0, text.length)
			expect(result).toBeNull()
		})

		it(`does not parse link text when clsoing ../../../../src/{end} is missing`, () => {
			const { linkTitleParser } = createLinkTitleParser()
			const text = `../../../../src/{start}the link title`

			const result = linkTitleParser.parseLine(null, text, 0, text.length)
			expect(result).toBeNull()
		})

		it(`parses link title text with escaped ../../../../src/{start} and ../../../../src/{end}`, () => {
			const { linkTitleParser } = createLinkTitleParser()
			const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

			const result = linkTitleParser.parseLine(null, text, 0, text.length)
			expect(result).toHaveProperty('type', 'link-title')
			expect(result?.value).toEqual(`the ../../../../src/{start}link../../../../src/{end} title`.replaceAll('"', '&quot;'))
			
			expect(result?.lines[0]).toHaveProperty('asText', `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end}`)
		})
	}))
	describe('parsing updates', () => {
		const delimiters: [string, string][] = [['"', '"'], ["'", "'"], ['(', ')']]
		delimiters.forEach(([start, end]) => describe(`parsing update for title between ../../../../src/{start} and ../../../../src/{end}`, () => {
			it('parses update do link title', () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: 'updated ', rangeOffset: `../../../../src/{start}the `.length, rangeLength: 0 })

				expect(updated).toHaveProperty('value', `the updated ../../../../src/{start}link../../../../src/{end} title`.replaceAll('"', '&quot;'))
				expect(updated?.lines[0]).toHaveProperty('asText', `../../../../src/{start}the updated \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end}`)
			})
			it(`does not parse update that contains the starting delimiter ../../../../src/{start}`, () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: `../../../../src/{start}`, rangeOffset: `../../../../src/{start}the `.length, rangeLength: 0 })

				expect(updated).toBeNull()
			})
			it(`does not parse update that contains the ending delimiter ../../../../src/{end}`, () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: `../../../../src/{end}`, rangeOffset: `../../../../src/{start}the `.length, rangeLength: 0 })

				expect(updated).toBeNull()
			})
			it(`does not parse update that contains a backslash`, () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: `\\`, rangeOffset: `../../../../src/{start}the `.length, rangeLength: 0 })

				expect(updated).toBeNull()
			})
			it(`does not parse update that replaces the starting delimiter ../../../../src/{start}`, () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: ``, rangeOffset: `../../../../src/{start}the \\`.length, rangeLength: 1 })

				expect(updated).toBeNull()
			})
			it(`does not parse update that replaces the ending delimiter ../../../../src/{end}`, () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: ``, rangeOffset: `../../../../src/{start}the \\../../../../src/{start}link\\`.length, rangeLength: 1 })

				expect(updated).toBeNull()
			})
			it(`does not parse update that replaces a backslash`, () => {
				const { linkTitleParser, idGenerator, } = createLinkTitleParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `../../../../src/{start}the \\../../../../src/{start}link\\../../../../src/{end} title../../../../src/{end} text after link ../../../../src/{end}`

				const original = linkTitleParser.parseLine(null, text, 0, text.length) as MfMLinkTitle
				const updated = updateParser.parse(original, { text: ``, rangeOffset: `../../../../src/{start}the `.length, rangeLength: 1 })

				expect(updated).toBeNull()
			})
		}))
	})
})
