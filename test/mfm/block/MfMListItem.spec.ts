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

import { not } from "omnimock"
import { MfMList } from "../../../src/mfm/block/MfMList"
import { createListItemParser } from "./createListParser"

describe('MfMListItem', () => {
	describe('parsing the content', () => {
		it('parses single-line, non-empty list item (line only)', () => {
			const { parser } = createListItemParser()
			const text = 'text before\n* list item'
			
			const result = parser.parseLine(null, text, 'text before\n'.length, '* list item'.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result?.lines[0]).toHaveProperty('asText', '* list item')

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', '* list item')
		})
		it('parses single-line, non-empty list item (paragraph content)', () => {
			const { parser } = createListItemParser()
			const text = 'text before\n* list item'
			
			const result = parser.parseLine(null, text, 'text before\n'.length, '* list item'.length)

			expect(result).not.toBeNull()
			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		});
		[ '*', '-', '+' ].forEach(marker => it(`parses bullet list item that starts with ${marker}`, () => {
			const { parser } = createListItemParser()
			const listItemText = `${marker} list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `${marker} list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('itemType', 'plain')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `${marker} list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		}));
		it('does not parse list item with no whitespace', () => {
			const { parser } = createListItemParser()
			const text = `*list item`
			
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).toBeNull()
		});
		[ ' ', '  ', '   ', '    ' ].forEach(whitespace => it(`parses list item with ${whitespace.length} whitespaces`, () => {
			const { parser } = createListItemParser()
			const text = `*${whitespace}list item`
			
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `*${whitespace}list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `*${whitespace}list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		}))
		it('parses list item with 5 spaces as list item with indented code block', () => {
			const { parser } = createListItemParser()
			const text = `*     list item`
			
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `*     list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `*     list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'indented-code-block')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', '    list item')
		});
		[ '1.', '35.', '1)', '8691)' ].forEach(marker => it(`parses ordered list item that starts with ${marker}`, () => {
			const { parser } = createListItemParser()
			const listItemText = `${marker} list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'ordered')
			expect(result?.lines[0]).toHaveProperty('asText', `${marker} list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('itemType', 'plain')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `${marker} list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		}));

		it('parses an unchecked task list item', () => {
			const { parser } = createListItemParser()
			const listItemText = `* [ ] list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `* [ ] list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('itemType', 'task')
			expect(result?.content[0]).toHaveProperty('taskState', ' ')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `* [ ] list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		})

		it('parses a checked task list item', () => {
			const { parser } = createListItemParser()
			const listItemText = `* [x] list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `* [x] list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('itemType', 'task')
			expect(result?.content[0]).toHaveProperty('taskState', 'x')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `* [x] list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		})

		it('parses a special task list item', () => {
			const { parser } = createListItemParser()
			const listItemText = `* [i] list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `* [i] list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('itemType', 'task')
			expect(result?.content[0]).toHaveProperty('taskState', 'i')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `* [i] list item`)

			expect(result?.content[0].content).toHaveLength(1)
			expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		})

		describe('continuing the list item with more content', () => {
			it('can continue a list with another item', () => {
				const { parser } = createListItemParser()
				const listItemText1 = `* list item`
				const listItemText2 = `  more content`
				const text = `${listItemText1}\n${listItemText2}`
				
				const intermediate = parser.parseLine(null, text, 0, listItemText1.length) as MfMList
				const result = parser.parseLine(intermediate.content[0], text, listItemText1.length+1, listItemText2.length) as MfMList
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `* list item`)
				expect(result?.lines[1]).toHaveProperty('asText', `  more content`)

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `* list item`)
				expect(result?.content[0].lines[1]).toHaveProperty('asText', `  more content`)
	
				expect(result?.content[0].content).toHaveLength(1)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
				expect(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
			});

			[[''], [' ', ''], ['   ', '\t', '  \t  ']].forEach(sep => it(`parses list item with two paragraphs, separated by ${JSON.stringify(sep)}`, () => {
				const { parser } = createListItemParser()
				const contents = [
					`* list item`,
					...sep,
					`  more content`,
				]
				const text = contents.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const result = contents.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `* list item`)
				expect(result?.lines[result.lines.length-1]).toHaveProperty('asText', `  more content`)

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `* list item`)
				expect(result?.content[0].lines[result.content[0].lines.length-1]).toHaveProperty('asText', `  more content`)
	
				expect(result?.content[0].content).toHaveLength(contents.length)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
				sep.forEach((s, i) => {
					expect(result?.content[0].content[i+1]).toHaveProperty('type', '--empty--')
					expect(result?.content[0].content[i+1].lines[0]).toHaveProperty('asText', s)
				})
				expect(result?.content[0].content[contents.length-1]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[contents.length-1].lines[0]).toHaveProperty('asText', 'more content')
			}))

			it('parses a list item inside a list item', () => {
				const { parser } = createListItemParser()
				const contents = [
					`* list item`,
					'',
					`  * an inner item`,
				]
				const text = contents.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const result = contents.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed
	
				expect(result).not.toBeNull()

				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `* list item`)
				expect(result?.lines[result.lines.length-1]).toHaveProperty('asText', `  * an inner item`)

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `* list item`)
				expect(result?.content[0].lines[result.content[0].lines.length-1]).toHaveProperty('asText', `  * an inner item`)

				expect(result?.content[0].content).toHaveLength(3)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')

				expect(result?.content[0].content[2]).toHaveProperty('type', 'list')
				expect(result?.content[0].content[2].lines[0]).toHaveProperty('asText', '* an inner item')
				expect(result?.content[0].content[2].content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0].content[2].content[0].lines[0]).toHaveProperty('asText', '* an inner item')
				expect(result?.content[0].content[2].content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[2].content[0].content[0].lines[0]).toHaveProperty('asText', 'an inner item')
			})

			it('does not parse a list item at the toplevel', () => {
				const { parser } = createListItemParser()
				const contents = [
					`* list item`,
					`* another toplevel item`,
				]
				const text = contents.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const result = contents.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed
	
				expect(result).toBeNull()
			})
		})
	})
	describe('parsing options', () => {
		it.skip('parses single-line options on a normal bullet list item', () => {})
		it.skip('parses single-line options on a normal numbered list item', () => {})
		it.skip('parses single-line options on a task bullet list item', () => {})
		it.skip('parses multi-line options on a normal bullet list item', () => {})
		it.skip('parses multi-line options on a normal numbered list item', () => {})
		it.skip('parses multi-line options on a task bullet list item', () => {})
	})
	describe('parsing updates', () => {
		//TODO test options thoroughly
		
		//TODO test task lists thoroughly, e.g.:
		// * "- [ ] whatever" -> "- [x] whatever"
		// * "- [x] whatever" -> "- [ ] whatever"
		// * "- [x] whatever" -> "- [i] whatever"
		// * "- whatever" -> "- [] whatever"
		// * "- [ whatever" -> "- [x] whatever"
		// * "- [x] whatever" -> "- [x whatever"
		// * "- [  ] whatever" -> "- [ ] whatever"
		// * "- [ ] whatever" -> "- [  ] whatever"
	})
})
