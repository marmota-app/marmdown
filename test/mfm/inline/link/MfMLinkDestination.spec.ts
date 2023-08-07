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
import { MfMLinkDestination } from "$mfm/inline/link/MfMLinkDestination"
import { createLinkDestinationParser } from "./createLinkParser"

describe('MfMLinkDestination', () => {
	describe('Parsing the content ("normal" urls)', () => {
		it('parses empty url', () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = 'text before ()'

			const result = linkDestinationParser.parseLine(null, text, 'text before ('.length, text.length-'text before ('.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result?.target).toEqual('')

			expect(result?.lines[0]).toHaveProperty('asText', '')
		})
		it('parses URL content', () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = 'http://example.com)'

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result).toHaveProperty('target', 'http://example.com')

			expect(result?.lines[0]).toHaveProperty('asText', 'http://example.com')
		})
		it('ends URL content at whitespace', () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = 'http://example.com and more content)'

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result).toHaveProperty('target', 'http://example.com')

			expect(result?.lines[0]).toHaveProperty('asText', 'http://example.com')
		})
		it('does not end URL content at escaped whitespace', () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = 'http://example.com\\ with\\ whitespaces and more content)'

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result).toHaveProperty('target', 'http://example.com with whitespaces')

			expect(result?.lines[0]).toHaveProperty('asText', 'http://example.com\\ with\\ whitespaces')
		});

		['(', ')'].forEach(parens => it(`does not end URL content at escaped parenthesis "${parens}"`, () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = `http://example.com\\${parens}with\\${parens}parenthesis and more content)`

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result).toHaveProperty('target', `http://example.com${parens}with${parens}parenthesis`)

			expect(result?.lines[0]).toHaveProperty('asText', `http://example.com\\${parens}with\\${parens}parenthesis`)
		}));

		['"', "'", '('].forEach(delimiter => it(`ends URL that is started by delimiter "${delimiter}"`, () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = `${delimiter}http://example.com)`

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)
			
			expect(result).toBeNull()
		}))
	})
	describe('Parsing the content (urls in angle brackets)', () => {
		it('parses empty url in agle brackets', () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = 'text before (<>)'

			const result = linkDestinationParser.parseLine(null, text, 'text before ('.length, text.length-'text before ('.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result?.target).toEqual('')

			expect(result?.lines[0]).toHaveProperty('asText', '<>')
		});
		['destination', 'destination with spaces', 'destination(with)parenthesis', 'destination "with" quotes', "destination 'with' single quotes"].forEach(target => it(`parses destination target "${target}" in angle brackets`, () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = `<${target}>`

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result?.target).toEqual(target)

			expect(result?.lines[0]).toHaveProperty('asText', `<${target}>`)
		}));
		['destination\\>with bracket', 'destination\\<with bracket'].forEach(target => it(`does not end destination with escaped bracket "${target}" in angle brackets`, () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = `<${target}>`

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toHaveProperty('type', 'link-destination')
			expect(result?.target).toEqual(target.replaceAll('\\', ''))

			expect(result?.lines[0]).toHaveProperty('asText', `<${target}>`)
		}))
		it('does not parse destination when the closing angle bracket is missing', () => {
			const { linkDestinationParser } = createLinkDestinationParser()
			const text = `<not a destination`

			const result = linkDestinationParser.parseLine(null, text, 0, text.length)

			expect(result).toBeNull()
		})
	})
	describe('parsing updates', () => {
		it('updates a destination when text is inserted', () => {
			const { linkDestinationParser, idGenerator } = createLinkDestinationParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = `<the link destination>`

			const original = linkDestinationParser.parseLine(null, text, 0, text.length) as MfMLinkDestination
			const updated = updateParser.parse(original, { text: 'updated ', rangeOffset: '<the '.length, rangeLength: 0, })

			expect(updated).toHaveProperty('target', 'the updated link destination')
			expect(updated?.lines[0]).toHaveProperty('asText', '<the updated link destination>')
		});
		['<', '>', '(', ')'].forEach(char => it(`does not update destination when "${char}" is inserted`, () => {
			const { linkDestinationParser, idGenerator } = createLinkDestinationParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = `<the link destination>`

			const original = linkDestinationParser.parseLine(null, text, 0, text.length) as MfMLinkDestination
			const updated = updateParser.parse(original, { text: ' '+char+' ', rangeOffset: '<the '.length, rangeLength: 0, })
			expect(updated).toBeNull()
		}));
		['\\', '<', '>', '(', ')'].forEach(char => it(`does not update destination when "${char} is removed`, () => {
			const { linkDestinationParser, idGenerator } = createLinkDestinationParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = `<the link\\${char} destination>`

			const original = linkDestinationParser.parseLine(null, text, 0, text.length) as MfMLinkDestination
			const updated = updateParser.parse(original, { text: '', rangeOffset: '<the link\\'.length, rangeLength: 3, })
			expect(updated).toBeNull()
		}))
		it('does not update destination when angle bracket is removed at the beginning', () => {
			const { linkDestinationParser, idGenerator } = createLinkDestinationParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = `<the link destination>`

			const original = linkDestinationParser.parseLine(null, text, 0, text.length) as MfMLinkDestination
			const updated = updateParser.parse(original, { text: '', rangeOffset: 0, rangeLength: 1, })
			expect(updated).toBeNull()
		})
		it('does not update destination when angle bracket is removed at the end', () => {
			const { linkDestinationParser, idGenerator } = createLinkDestinationParser()
			const updateParser = new UpdateParser(idGenerator)
			const text = `<the link destination>`

			const original = linkDestinationParser.parseLine(null, text, 0, text.length) as MfMLinkDestination
			const updated = updateParser.parse(original, { text: '', rangeOffset: '<the link destination'.length, rangeLength: 1, })
			expect(updated).toBeNull()
		})
	})
})
