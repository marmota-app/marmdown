/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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
import { ContentChange } from "$markdown/ContentChange"
import { Level } from "$markdown/MarkdownDocument"
import { ContentOptions, Options } from "$markdown/MarkdownOptions"
import { MfMParsers } from "$markdown/MfMParsers"
import { HeadingParser, UpdatableHeading } from "$markdown/toplevel/HeadingParser"

describe('HeadingParser', () => {
	const headingParser = new HeadingParser(new MfMParsers())

	const headingIdentifiers: string[] = [ '#', '##', '###', '####', '#####', '######', ]
	headingIdentifiers.forEach((h: string) => {
		it(`heading level ${h.length} creates Headline`, () => {
			const markdown = h + ' Foobar\n'

			const result = headingParser.parse(markdown, 0, markdown.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'Heading')
			expect(result).toHaveProperty('level', h.length)
			expect(result).toHaveProperty('text', 'Foobar')
			expect(result?.length).toEqual(markdown.length - '\n'.length)
		})

		it(`creates empty heading for single ${h}`, () => {
			const markdown = h

			const result = headingParser.parse(markdown, 0, markdown.length)

			expect(result).toHaveProperty('type', 'Heading')
			expect(result).toHaveProperty('level', h.length)
			expect(result).toHaveProperty('text', '')
			expect(result?.length).toEqual(markdown.length)
		})
	})

	const illegalHeadingStarts = [ '####### foobar', '#foobar']
	illegalHeadingStarts.forEach(is => it(`does not parse a heading for an illegal heading start "${is}"`, () => {
		const result = headingParser.parse(is, 0, is.length)

		expect(result).toBeNull()
	}))

	it(`does not parse a heading for an legal heading start "#"`, () => {
		const result = headingParser.parse('#', 0, '#'.length)

		expect(result).not.toBeNull()
	})
	it(`does not parse a heading for an legal heading start "#\r"`, () => {
		const result = headingParser.parse('#', 0, '#'.length)

		expect(result).not.toBeNull()
	})
	it(`does not parse a heading for an legal heading start "#\n"`, () => {
		const result = headingParser.parse('#', 0, '#'.length)

		expect(result).not.toBeNull()
	})

	it('parses heading options', () => {
		const markdown = '#{ foo = bar } Foobar\n'

		const result = headingParser.parse(markdown, 0, markdown.length)

		expect(result?.options).toHaveProperty('foo', 'bar')
	})

	describe('partial parsing of headings', () => {
		interface ExpectedResult { level: Level, heading: string, options: ContentOptions, completeText: string }

		const markdown = '      \n#{ option } The Heading'
		const existingHeading = () => {
			return headingParser.parse(markdown, 7, markdown.length)
		}

		const data: [ ContentChange, ExpectedResult | null, ][] = [
			[ { rangeOffset: 4, rangeLength: 0, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 4, rangeLength: 10, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 100, rangeLength: 0, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 9, rangeLength: 100, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 7, rangeLength: 0, text: '#', range: undefined }, { level: 2, heading: 'The Heading', options: { default: 'option' }, completeText: '##{ option } The Heading', } ],
			[ { rangeOffset: 7, rangeLength: 1, text: '###', range: undefined }, { level: 3, heading: 'The Heading', options: { default: 'option' }, completeText: '###{ option } The Heading', } ],
			[ { rangeOffset: 7+'#{ '.length, rangeLength: 0, text: '_', range: undefined }, { level: 1, heading: 'The Heading', options: { default: '_option' }, completeText: '#{ _option } The Heading', } ],
			[ { rangeOffset: 7+'#{ option } '.length, rangeLength: 0, text: 'Wow, ', range: undefined }, { level: 1, heading: 'Wow, The Heading', options: { default: 'option' }, completeText: '#{ option } Wow, The Heading', } ],
			[ { rangeOffset: 7+'#{ option } The '.length, rangeLength: 'Heading'.length, text: 'Überschrift', range: undefined }, { level: 1, heading: 'The Überschrift', options: { default: 'option' }, completeText: '#{ option } The Überschrift', } ],
			[ { rangeOffset: 7+'#{ option } The Heading'.length, rangeLength: 0, text: 's', range: undefined }, { level: 1, heading: 'The Headings', options: { default: 'option' }, completeText: '#{ option } The Headings', } ],
		]
		data.forEach(td => it(`parses ${JSON.stringify(td[0])} as ${JSON.stringify(td[1])}`, () => {
			const existing = existingHeading()!
			const result = existing.parsedWith!.parsePartial(existing, td[0])

			if(td[1]) {
				expect(result?.start).toEqual(existing.start)
				expect(result?.length).toEqual(td[1].completeText.length)

				expect(result).toHaveProperty('text', td[1].heading)
				expect(result).toHaveProperty('asText', td[1].completeText)
				expect(result).toHaveProperty('level', td[1].level)
				expect(result).toHaveProperty('options', td[1].options)
			} else {
				expect(result).toBeNull()
			}
		}))
	})

})
