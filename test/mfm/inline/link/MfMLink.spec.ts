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
import { UpdateParser } from "$markdown/UpdateParser"
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
	describe('parsing reference links', () => {
		it('parses full reference link', () => {
			const { linkParser } = createLinkParser()
			const text = '[link text][link label]'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.references).toHaveProperty('type', 'link-text')
			expect(result.references).toHaveProperty('normalized', 'link label')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('does not parse full reference link when there is no closing bracket', () => {
			const { linkParser } = createLinkParser()
			const text = '[not a link][not a link label'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', '--text-span--')
			expect(result.content).toHaveLength(4)
			expect(result.content[0]).toHaveProperty('text', '[')
			expect(result.content[1].content[0]).toHaveProperty('text', 'not a link')
			expect(result.content[2]).toHaveProperty('text', '][')
			expect(result.content[3].content[0]).toHaveProperty('text', 'not a link label')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('parses collapsed reference link', () => {
			const { linkParser } = createLinkParser()
			const text = '[link text and label][]'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.references).toHaveProperty('type', 'link-text')
			expect(result.references).toHaveProperty('normalized', 'link text and label')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('parses shortcut reference link', () => {
			const { linkParser } = createLinkParser()
			const text = '[link text and label]'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'link')
			expect(result.references).toHaveProperty('type', 'link-text')
			expect(result.references).toHaveProperty('normalized', 'link text and label')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
	})
	describe('parsing the content (image links)', () => {
		it('parses normal image link', () => {
			const { linkParser } = createLinkParser()
			const text = '![alt text](http://example.com "image title")'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'image')
			expect(result.text?.content[0]).toHaveProperty('text', 'alt text')
			expect(result.destination).toHaveProperty('target', 'http://example.com')
			expect(result.title).toHaveProperty('value', 'image title')
			expect(result.references).toBeUndefined()

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('parses reference image link', () => {
			const { linkParser } = createLinkParser()
			const text = '![alt text][link reference]'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result).toHaveProperty('type', 'image')
			expect(result.text?.content[0]).toHaveProperty('text', 'alt text')
			expect(result.destination).toBeUndefined()
			expect(result.title).toBeUndefined()
			expect(result.references).toHaveProperty('normalized', 'link reference')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
	})
	describe('parsing options', () => {
		it('parses options after normal link', () => {
			const { linkParser } = createLinkParser()
			const text = '[alt text](http://example.com "image title"){ default value; key2=value2 }'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result.options.get('default')).toEqual('default value')
			expect(result.options.get('key2')).toEqual('value2')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('parses options after normal reference link', () => {
			const { linkParser } = createLinkParser()
			const text = '[alt text][reference]{ default value; key2=value2 }'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result.options.get('default')).toEqual('default value')
			expect(result.options.get('key2')).toEqual('value2')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('parses options after collapsed reference link', () => {
			const { linkParser } = createLinkParser()
			const text = '[alt text][]{ default value; key2=value2 }'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result.options.get('default')).toEqual('default value')
			expect(result.options.get('key2')).toEqual('value2')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
		it('parses options after shortcut reference link', () => {
			const { linkParser } = createLinkParser()
			const text = '[alt text]{ default value; key2=value2 }'

			const result = linkParser.parseLine(null, text, 0, text.length) as MfMLink

			expect(result.options.get('default')).toEqual('default value')
			expect(result.options.get('key2')).toEqual('value2')

			expect(result.lines[0]).toHaveProperty('asText', text)
		})
	})
	describe('parsing updates', () => {
		it('parses update to link text', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = '[link text](destination "title")'

			const original = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(original, { text: 'updated', rangeOffset: 1, rangeLength: 4}) as MfMLink

			expect(updated).toHaveProperty('type', 'link')
			expect(updated.text?.content[0]).toHaveProperty('text', 'updated text')
			expect(updated.destination).toHaveProperty('target', 'destination')
			expect(updated.title).toHaveProperty('value', 'title')
			expect(updated.references).toBeUndefined()

			expect(updated.lines[0]).toHaveProperty('asText', '[updated text](destination "title")')
		})
		it('parses update to link destination', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = '[link text](destination "title")'

			const original = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(original, { text: 'updated_', rangeOffset: '[link text]('.length, rangeLength: 0}) as MfMLink

			expect(updated).toHaveProperty('type', 'link')
			expect(updated.text?.content[0]).toHaveProperty('text', 'link text')
			expect(updated.destination).toHaveProperty('target', 'updated_destination')
			expect(updated.title).toHaveProperty('value', 'title')
			expect(updated.references).toBeUndefined()

			expect(updated.lines[0]).toHaveProperty('asText', '[link text](updated_destination "title")')
		})
		it('parses update to link title', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = '[link text](destination "title")'

			const original = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(original, { text: 'updated ', rangeOffset: '[link text](destination "'.length, rangeLength: 0}) as MfMLink

			expect(updated).toHaveProperty('type', 'link')
			expect(updated.text?.content[0]).toHaveProperty('text', 'link text')
			expect(updated.destination).toHaveProperty('target', 'destination')
			expect(updated.title).toHaveProperty('value', 'updated title')
			expect(updated.references).toBeUndefined()

			expect(updated.lines[0]).toHaveProperty('asText', '[link text](destination "updated title")')
		})
		it('parses update to link reference', () => {
			const { linkParser, idGenerator } = createLinkParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = '[link text][reference]'

			const original = linkParser.parseLine(null, text, 0, text.length) as MfMLink
			const updated = updateParser.parse(original, { text: 'updated ', rangeOffset: '[link text]['.length, rangeLength: 0}) as MfMLink

			expect(updated).toHaveProperty('type', 'link')
			expect(updated.text?.content[0]).toHaveProperty('text', 'link text')
			expect(updated.destination).toBeUndefined()
			expect(updated.title).toBeUndefined()
			expect(updated.references?.content[0]).toHaveProperty('text', 'updated reference')

			expect(updated.lines[0]).toHaveProperty('asText', '[link text][updated reference]')
		});

		['!', '(', ')', '[', ']', '"', "'", '\\', '<', '>'].forEach(token => {
			it(`does not update the link when "${token}" is inserted`, () => {
				const { linkParser, idGenerator } = createLinkParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = '[link text](destination "title")'
	
				const original = linkParser.parseLine(null, text, 0, text.length) as MfMLink
				const updated = updateParser.parse(original, { text: token, rangeOffset: 1, rangeLength: 0}) as MfMLink
	
				expect(updated).toBeNull()
			})
			it(`does not update the link when "${token}" is removed`, () => {
				const { linkParser, idGenerator } = createLinkParser()
				const updateParser = new UpdateParser(idGenerator)
				const text = `[\\${token}link text](destination "title")`
	
				const original = linkParser.parseLine(null, text, 0, text.length) as MfMLink
				const updated = updateParser.parse(original, { text: 'other text', rangeOffset: 2, rangeLength: 1}) as MfMLink
	
				expect(updated).toBeNull()
			})
		})
	})
})