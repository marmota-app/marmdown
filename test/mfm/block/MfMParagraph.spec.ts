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

import { UpdateParser } from "$../../../src/UpdateParser"
import { MfMParagraph } from "../../../src/mfm/block/MfMParagraph"
import { MfMContentLine } from "../../../src/mfm/inline/MfMContentLine"
import { createParagraphParser } from "./createParagraphParser"

describe('MfMParagraph parser', () => {
	describe('parsing the content', () => {
		it('parses single-line simple text content', () => {
			const { paragraphParser } = createParagraphParser()

			const text = 'hello world'
			const result = paragraphParser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', '--content-line--')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0].content[0]).toHaveProperty('text', text)
		})

		it('parses a second text content line', () => {
			const { paragraphParser } = createParagraphParser()

			const line1 = 'hello world'
			const line2 = 'hello marmota'
			const text = `${line1}\n${line2}`
			const first = paragraphParser.parseLine(null, text, 0, line1.length)
			const result = paragraphParser.parseLine(first, text, `${line1}\n`.length, line2.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('type', '--content-line--')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0].content[0]).toHaveProperty('text', line1)
			expect(result?.content[1]).toHaveProperty('type', '--content-line--')
			expect(result?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[1].content[0]).toHaveProperty('text', line2)

			expect(result?.lines).toHaveLength(2)
			expect(result?.lines[0]).toHaveProperty('asText', line1)
			expect(result?.lines[1]).toHaveProperty('asText', line2)
		});

		[ '', '    ', '\t', '  \t    \t ' ].forEach((empty: string) => it(`ends paragraph at an empty line "${empty.replaceAll('\t', '\\t')}"`, () => {
			const { paragraphParser } = createParagraphParser()
			const line1 = 'hello world'
			const text = `${line1}\n${empty}\n---ignore me---`

			const first = paragraphParser.parseLine(null, text, 0, line1.length)
			const result = paragraphParser.parseLine(first, text, `${line1}\n`.length, empty.length)

			expect(result).toBeNull()
			expect(first).toHaveProperty('isFullyParsed', true)
		}))
		it('ends paragraph on block content (e.g. heading)', () => {
			const { paragraphParser } = createParagraphParser()
			const line1 = 'hello world'
			const heading = '# I am a heading'
			const text = `${line1}\n${heading}\n---ignore me---`

			const first = paragraphParser.parseLine(null, text, 0, line1.length)
			const result = paragraphParser.parseLine(first, text, `${line1}\n`.length, heading.length)

			expect(result).toBeNull()
			expect(first).toHaveProperty('isFullyParsed', true)
		})
	})
	describe('indentation', () => {
		[' ', '  ', '   '].forEach(spaces => it(`removes ${spaces.length} leading spaces from the first line of a paragraph`, () => {
			const { paragraphParser } = createParagraphParser()

			const text = `${spaces}hello world`
			const result = paragraphParser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.lines[0]).toHaveProperty('asText', text)
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', '--content-line--')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0].content[0]).toHaveProperty('text', 'hello world')
		}))
	})
	describe('the content of paragraphs', () => {
		it('parses text with bold content', () => {
			const { paragraphParser } = createParagraphParser()

			const text = 'text before **bold content** text after'
			const result = paragraphParser.parseLine(null, text, 0, text.length)

			expect(result?.content).toHaveLength(1)
			const line = result?.content[0] as MfMContentLine

			expect(line.content).toHaveLength(3)
			expect(line.content[0]).toHaveProperty('type', 'text')
			expect(line.content[0]).toHaveProperty('text', 'text before ')
			expect(line.content[1]).toHaveProperty('type', 'strong')
			expect(line.content[1].content[0]).toHaveProperty('text', 'bold content')
			expect(line.content[2]).toHaveProperty('type', 'text')
			expect(line.content[2]).toHaveProperty('text', ' text after')
		})
		it('parses text with bold, italic and strike-through content', () => {
			const { paragraphParser } = createParagraphParser()

			const text = 'text before **bold content**_italic content_~striked content~ text after'
			const result = paragraphParser.parseLine(null, text, 0, text.length)

			expect(result?.content).toHaveLength(1)
			const line = result?.content[0] as MfMContentLine

			expect(line.content).toHaveLength(5)
			expect(line.content[0]).toHaveProperty('type', 'text')
			expect(line.content[0]).toHaveProperty('text', 'text before ')
			expect(line.content[1]).toHaveProperty('type', 'strong')
			expect(line.content[1].content[0]).toHaveProperty('text', 'bold content')
			expect(line.content[2]).toHaveProperty('type', 'emphasis')
			expect(line.content[2].content[0]).toHaveProperty('text', 'italic content')
			expect(line.content[3]).toHaveProperty('type', 'strike-through')
			expect(line.content[3].content[0]).toHaveProperty('text', 'striked content')
			expect(line.content[4]).toHaveProperty('type', 'text')
			expect(line.content[4]).toHaveProperty('text', ' text after')
		})
	})
	describe('parsing paragraph options', () => {
		it('parses paragraph options at the start of the paragraph', () => {
			const { paragraphParser } = createParagraphParser()

			const lines = [
				'{ default value; key2 = value2 }',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const result = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			)
			
			expect(result.value?.lines).toHaveLength(2)
			lines.forEach((l, i) => expect(result.value?.lines[i]).toHaveProperty('asText', l))

			expect(result.value?.options.get('default')).toEqual('default value')
			expect(result.value?.options.get('key2')).toEqual('value2')
		})
		it('parses paragraph options at the start of the paragraph with text in the same line', () => {
			const { paragraphParser } = createParagraphParser()

			const lines = [
				'{ default value; key2 = value2 } first line text',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const result = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			)
			
			expect(result.value?.content).toHaveLength(2)
			expect(result.value?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[0].content[0]).toHaveProperty('text', 'first line text')
			expect(result.value?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[1].content[0]).toHaveProperty('text', 'more paragraph text')

			expect(result.value?.lines).toHaveLength(2)
			lines.forEach((l, i) => expect(result.value?.lines[i]).toHaveProperty('asText', l))

			expect(result.value?.options.get('default')).toEqual('default value')
			expect(result.value?.options.get('key2')).toEqual('value2')
		})
		it('does not parse options in the second line', () => {
			const { paragraphParser } = createParagraphParser()

			const lines = [
				'line before options',
				'{ default value; key2 = value2 } first line text',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const result = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			)
			
			expect(result.value?.content).toHaveLength(3)
			expect(result.value?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[0].content[0]).toHaveProperty('text', 'line before options')
			expect(result.value?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[1].content[0]).toHaveProperty('text', '{ default value; key2 = value2 } first line text')
			expect(result.value?.content[2].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[2].content[0]).toHaveProperty('text', 'more paragraph text')

			expect(result.value?.lines).toHaveLength(3)
			lines.forEach((l, i) => expect(result.value?.lines[i]).toHaveProperty('asText', l))

			expect(result.value?.options.get('default')).toBeUndefined()
			expect(result.value?.options.get('key2')).toBeUndefined()
		})
		it('parses multi-line options at the start of the paragraph', () => {
			const { paragraphParser } = createParagraphParser()

			const lines = [
				'{ default value',
				'key2 = value2 } first line text',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const result = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			)
			
			expect(result.value?.content).toHaveLength(2)
			expect(result.value?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[0].content[0]).toHaveProperty('text', 'first line text')
			expect(result.value?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(result.value?.content[1].content[0]).toHaveProperty('text', 'more paragraph text')

			expect(result.value?.lines).toHaveLength(3)
			lines.forEach((l, i) => expect(result.value?.lines[i]).toHaveProperty('asText', l))

			expect(result.value?.options.get('default')).toEqual('default value')
			expect(result.value?.options.get('key2')).toEqual('value2')
		})
	})
	describe('parsing updates', () => {
		it('parses update to the content', () => {
			const { paragraphParser, idGenerator } = createParagraphParser()
			const updateParser = new UpdateParser(idGenerator)

			const lines = [
				'{ default value',
				'key2 = value2 } first line text',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const original = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			).value as MfMParagraph
			const updated = updateParser.parse(original, { text: ' updated', rangeOffset: '{ default value\nkey2 = value2 } first line'.length, rangeLength: ''.length }) as MfMParagraph
			
			expect(updated.content).toHaveLength(2)
			expect(updated.content[0].content[0]).toHaveProperty('type', 'text')
			expect(updated.content[0].content[0]).toHaveProperty('text', 'first line updated text')
			expect(updated.content[1].content[0]).toHaveProperty('type', 'text')
			expect(updated.content[1].content[0]).toHaveProperty('text', 'more paragraph text')

			expect(updated.options.get('default')).toEqual('default value')
			expect(updated.options.get('key2')).toEqual('value2')

			expect(updated.lines).toHaveLength(3)
			lines.forEach((l, i) => {
				if(i === 1) { expect(updated.lines[i]).toHaveProperty('asText', 'key2 = value2 } first line updated text') }
				else { expect(updated.lines[i]).toHaveProperty('asText', l) }
			})
		})

		it('parses update to the options', () => {
			const { paragraphParser, idGenerator } = createParagraphParser()
			const updateParser = new UpdateParser(idGenerator)

			const lines = [
				'{ default value',
				'key2 = value2 } first line text',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const original = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			).value as MfMParagraph
			const updated = updateParser.parse(original, { text: ' two', rangeOffset: '{ default value\nkey2 = value'.length, rangeLength: '2'.length }) as MfMParagraph
			
			expect(updated.content).toHaveLength(2)
			expect(updated.content[0].content[0]).toHaveProperty('type', 'text')
			expect(updated.content[0].content[0]).toHaveProperty('text', 'first line text')
			expect(updated.content[1].content[0]).toHaveProperty('type', 'text')
			expect(updated.content[1].content[0]).toHaveProperty('text', 'more paragraph text')

			expect(updated.options.get('default')).toEqual('default value')
			expect(updated.options.get('key2')).toEqual('value two')

			expect(updated.lines).toHaveLength(3)
			lines.forEach((l, i) => {
				if(i === 1) { expect(updated.lines[i]).toHaveProperty('asText', 'key2 = value two } first line text') }
				else { expect(updated.lines[i]).toHaveProperty('asText', l) }
			})
		});

		['#', '[', '`', '*', '-', '=', '>', '^'].forEach(char => it(`does not parse update when the paragraph line starts with special character ${char}`, () => {
			const { paragraphParser, idGenerator } = createParagraphParser()
			const updateParser = new UpdateParser(idGenerator)

			const lines = [
				'#hello world',
				'second line text',
				'more paragraph text'
			]
			const text = lines.join('\n')
			const original = lines.reduce(
				(r: { value: MfMParagraph | null, start: number, }, line) => ({
					value: paragraphParser.parseLine(r.value, text, r.start, line.length),
					start: r.start+line.length+1,
				}),
				{ value: null, start: 0, }
			).value as MfMParagraph
			expect(original).not.toBeNull()
			const updated = updateParser.parse(original, { text: ' updated', rangeOffset: '#hello'.length, rangeLength: 0 }) as MfMParagraph

			expect(updated).toBeNull()
		}));
	})
})