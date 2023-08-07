/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance wit.skiph the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writ.skiping, software
distributed under the License is distributed on an "AS IS" BASIS,
WIT.SKIPHOUT WARRANTIES OR CONDIT.SKIPIONS OF ANY KIND, eit.skipher express or implied.
See the License for the specific language governing permissions and
limit.skipations under the License.
*/

import { TextSpan } from "$element/TextSpan"
import { MfMLink } from "$mfm/inline/link/MfMLink"
import { createLinkParser } from "./createLinkParser"

describe('MfMLink', () => {
	describe('parsing normal links', () => {
		it('parses empty link', () => {
			const { linkParser } = createLinkParser()
			const text = 'text before []()'

			const result = linkParser.parseLine(null, text, 'text before '.length, text.length-'text before '.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.text).toBeUndefined()
			expect(result.destination).toBeUndefined()
			expect(result.title).toBeUndefined()

			expect(result.lines[0]).toHaveProperty('asText', '[]()')
		})
		it('parses link text', () => {
			const { linkParser } = createLinkParser()
			const text = '[link text]()'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.text).toHaveProperty('type', 'link-text')
			expect(result.destination).toBeUndefined()
			expect(result.title).toBeUndefined()

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('does not parse link that misses the ending ]', () => {
			const { linkParser } = createLinkParser()
			const text = 'text before [link text()'

			const result = linkParser.parseLine(null, text, 'text before '.length, text.length-'text before '.length) as TextSpan<any>

			expect(result).toHaveProperty('type', '--text-span--')
			expect(result.content).toHaveLength(2)
			expect(result.content[1]).toHaveProperty('type', 'link-text')

			expect(result.lines[0]).toHaveProperty('asText', '[link text()')
		})
		it('parses link destination', () => {
			const { linkParser } = createLinkParser()
			const text = '[](http://example.com)'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.text).toBeUndefined()
			expect(result.destination).toHaveProperty('type', 'link-destination')
			expect(result.destination).toHaveProperty('target', 'http://example.com')
			expect(result.title).toBeUndefined()

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('does not parse link that misses the ending )', () => {
			const { linkParser } = createLinkParser()
			const text = '[some **text**](  http://example.com'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', '--text-span--')
			expect(result.content).toHaveLength(3)
			expect(result.content[1]).toHaveProperty('type', 'link-text')
			expect(result.content[1].lines[0]).toHaveProperty('asText', 'some **text**')
			expect(result.content[2]).toHaveProperty('type', 'text')
			expect(result.content[2]).toHaveProperty('text', '](  http://example.com')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('skips whitespace before destination', () => {
			const { linkParser } = createLinkParser()
			const text = '[]( \t  http://example.com)'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.text).toBeUndefined()
			expect(result.destination).toHaveProperty('type', 'link-destination')
			expect(result.destination).toHaveProperty('target', 'http://example.com')
			expect(result.title).toBeUndefined()

			expect(result.lines[0]).toHaveProperty('asText', text)
		});

		[['"', '"'], ["'", "'"], ['(', ')']].forEach(([open, close]) => {
			it(`parses ${open}link title${close} after destination`, () => {
				const { linkParser } = createLinkParser()
				const text = `[](<http://example.com> ${open}link title${close})`
	
				const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink
	
				expect(result).toHaveProperty('type', 'link')
				expect(result.text).toBeUndefined()
				expect(result.destination).toHaveProperty('type', 'link-destination')
				expect(result.destination).toHaveProperty('target', 'http://example.com')
				expect(result.title).toHaveProperty('type', 'link-title')
				expect(result.title).toHaveProperty('value', 'link title')
	
				expect(result.lines[0]).toHaveProperty('asText', text)	
			})

			it('does not parse link that misses the ending ) after the link title', () => {
				const { linkParser } = createLinkParser()
				const text = '[some **text**](  http://example.com "link title"'
	
				const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink
	
				expect(result).toHaveProperty('type', '--text-span--')
				expect(result.content).toHaveLength(3)
				expect(result.content[1]).toHaveProperty('type', 'link-text')
				expect(result.content[1].lines[0]).toHaveProperty('asText', 'some **text**')
				expect(result.content[2]).toHaveProperty('type', 'text')
				expect(result.content[2]).toHaveProperty('text', '](  http://example.com &quot;link title&quot;')
	
				expect(result.lines[0]).toHaveProperty('asText', text)
			})
	
			it(`parses ${open}link title${close} without destination`, () => {
				const { linkParser } = createLinkParser()
				const text = `[](  ${open}link title${close})`
	
				const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink
	
				expect(result).toHaveProperty('type', 'link')
				expect(result.text).toBeUndefined()
				expect(result.destination).toBeUndefined()
				expect(result.title).toHaveProperty('type', 'link-title')
				expect(result.title).toHaveProperty('value', 'link title')
	
				expect(result.lines[0]).toHaveProperty('asText', text)	
			})
		})
	})
	describe.skip('parsing reference links', () => {})
	describe.skip('parsing the content (image links)', () => {})
	describe.skip('parsing options', () => {})
	describe.skip('parsing updates', () => {})
})