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

			const result = headingParser.parse(null, markdown, 0, markdown.length)[0]

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'Heading')
			expect(result).toHaveProperty('level', h.length)
			expect(result).toHaveProperty('text', 'Foobar')
		})

		it(`creates empty heading for single ${h}`, () => {
			const markdown = h

			const result = headingParser.parse(null, markdown, 0, markdown.length)[0]

			expect(result).toHaveProperty('type', 'Heading')
			expect(result).toHaveProperty('level', h.length)
			expect(result).toHaveProperty('text', '')
		})

		it('returns content with correct start index and length', () => {
			const markdown = 'whatever' + h + ' Foobar\nand more content'

			const result = headingParser.parse(null, markdown, 'whatever'.length, (h + ' Foobar').length)[1]

			expect(result).not.toBeNull()
			expect(result?.start).toEqual('whatever'.length)
			expect(result?.length).toEqual((h + ' Foobar').length)
		})
	})

	const illegalHeadingStarts = [ '####### foobar', '#foobar']
	illegalHeadingStarts.forEach(is => it(`does not parse a heading for an illegal heading start "${is}"`, () => {
		const result = headingParser.parse(null, is, 0, is.length)[0]

		expect(result).toBeNull()
	}))

	it('does not parse multi-line heading when previous was fully parsed', () => {
		const markdown = '# Foobar'

		const previous = headingParser.parse(null, markdown, 0, markdown.length)[0]
		const result = headingParser.parse(null, 'next line', 0, 'next line'.length)[0]

		expect(result).toBeNull()
	})
	it('does parse multi-line heading when previous was NOT fully parsed', () => {
		const markdown = '# Foobar  '

		const previous = headingParser.parse(null, markdown, 0, markdown.length)[0]
		const result = headingParser.parse(previous, 'next line', 0, 'next line'.length)[0]

		expect(result).not.toBeNull()
		expect(result).toHaveProperty('text', 'Foobar next line')
		expect(result).toHaveProperty('lines', [ 'Foobar', 'next line', ])
	})
	it('does not parse heading itself when previous is available and was fully parsed', () => {
		const markdown = '# Foobar'

		const previous = headingParser.parse(null, markdown, 0, markdown.length)[0]
		const result = headingParser.parse(previous, '# next line', 0, '# next line'.length)[0]

		expect(result).toBeNull()
	})

	it('parses heading options', () => {
		const markdown = '#{ foo = bar } Foobar\n'

		const result = headingParser.parse(null, markdown, 0, markdown.length)[0]

		expect(result!.options).toHaveProperty('foo', 'bar')
	})

	it('parses multiline heading with multiline options', () => {
		const markdown = '#{ defaultValue;  \nfoo = bar }   \nFoo  \nbar\n'

		let result = headingParser.parse(null, '#{ defaultValue;  ', 0, '#{ defaultValue;  '.length)
		result = headingParser.parse(result[0], 'foo = bar }\t  ', 0, 'foo = bar }\t  '.length)
		result = headingParser.parse(result[0], 'Foo  ', 0, 'Foo  '.length)
		result = headingParser.parse(result[0], 'bar', 0, 'bar'.length)

		expect(result[0]).not.toBeNull()
		expect(result[0]!.options).toHaveProperty('default', 'defaultValue')
		expect(result[0]!.options).toHaveProperty('foo', 'bar')

		expect(result[0]).toHaveProperty('text', 'Foo bar')
		expect(result[0]).toHaveProperty('lines', [ 'Foo', 'bar', ])
	})

	describe('partial parsing of headings', () => {
		interface ExpectedResult { level: Level, heading: string, options: ContentOptions, completeText: string }

		const markdown = '      \n##{ option } The Heading'
		const existingHeading = () => {
			return headingParser.parse(null, markdown, 7, markdown.length)
		}

		const data: [ ContentChange, ExpectedResult | null, ][] = [
			[ { rangeOffset: 4, rangeLength: 0, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 4, rangeLength: 10, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 100, rangeLength: 0, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 9, rangeLength: 100, text: 'ignore', range: undefined }, null ],
			[ { rangeOffset: 7, rangeLength: 0, text: '#', range: undefined }, { level: 3, heading: 'The Heading', options: { default: 'option' }, completeText: '###{ option } The Heading', } ],
			[ { rangeOffset: 7, rangeLength: 2, text: '###', range: undefined }, { level: 3, heading: 'The Heading', options: { default: 'option' }, completeText: '###{ option } The Heading', } ],
			[ { rangeOffset: 7, rangeLength: 1, text: '', range: undefined }, { level: 1, heading: 'The Heading', options: { default: 'option' }, completeText: '#{ option } The Heading', } ],
			[ { rangeOffset: 7+'##{ '.length, rangeLength: 0, text: '_', range: undefined }, { level: 2, heading: 'The Heading', options: { default: '_option' }, completeText: '##{ _option } The Heading', } ],
			[ { rangeOffset: 7+'##{ option } '.length, rangeLength: 0, text: 'Wow, ', range: undefined }, { level: 2, heading: 'Wow, The Heading', options: { default: 'option' }, completeText: '##{ option } Wow, The Heading', } ],
			[ { rangeOffset: 7+'##{ option } The '.length, rangeLength: 'Heading'.length, text: 'Überschrift', range: undefined }, { level: 2, heading: 'The Überschrift', options: { default: 'option' }, completeText: '##{ option } The Überschrift', } ],
			[ { rangeOffset: 7+'##{ option } The Heading'.length, rangeLength: 0, text: 's', range: undefined }, { level: 2, heading: 'The Headings', options: { default: 'option' }, completeText: '##{ option } The Headings', } ],
		]
		data.forEach(td => it(`parses ${JSON.stringify(td[0])} as ${JSON.stringify(td[1])}`, () => {
			const existing = existingHeading()
			const result = existing[0]!.parsedWith!.parsePartial(existing[0]!, td[0])

			if(td[1]) {
				expect(result[1]?.start).toEqual(existing[1]!.start)
				expect(result[1]?.length).toEqual(td[1].completeText.length)

				expect(result[0]).toHaveProperty('text', td[1].heading)
				expect(result[1]).toHaveProperty('asText', td[1].completeText)
				expect(result[0]).toHaveProperty('level', td[1].level)
				expect(result[0]).toHaveProperty('options', td[1].options)
			} else {
				expect(result[0]).toBeNull()
			}
		}))
	})
})
