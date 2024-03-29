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

import { NumberedIdGenerator } from "../../../src/IdGenerator"
import { UpdateParser } from "../../../src/UpdateParser"
import { MfMList } from "../../../src/mfm/block/MfMList"
import { createListItemParser } from "./createListParser"

const assume = expect

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
		}));
		[ ' ', '  ', '   ' ].forEach(spaces => it(`parses list item with ${spaces.length} spaces before the marker`, () => {
			const { parser } = createListItemParser()
			const text = `${spaces}* list item`
			
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `${spaces}* list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('indent', spaces.length+2)
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `${spaces}* list item`)

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

		it('parses an empty unchecked task list item (special feature to support updates of items)', () => {
			const { parser } = createListItemParser()
			const listItemText = `* [] list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toHaveProperty('listType', 'bullet')
			expect(result?.lines[0]).toHaveProperty('asText', `* [] list item`)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('itemType', 'task')
			expect(result?.content[0]).toHaveProperty('taskState', ' ')
			expect(result?.content[0].lines[0]).toHaveProperty('asText', `* [] list item`)

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

			it('parses a mulit-line task list item', () => {
				const { parser } = createListItemParser()
				const contents = [
					`* [i] list item`,
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
				expect(result?.lines[0]).toHaveProperty('asText', `* [i] list item`)
				expect(result?.lines[1]).toHaveProperty('asText', `  more content`)

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('itemType', 'task')
				expect(result?.content[0]).toHaveProperty('taskState', 'i')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `* [i] list item`)
	
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
	
				expect(result?.content[0].content).toHaveLength(3)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')

				expect(result?.content[0].content[1]).toHaveProperty('type', '--empty--')
				expect(result?.content[0].content[1].lines).toHaveLength(sep.length)

				expect(result?.content[0].content[2]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[2].lines[0]).toHaveProperty('asText', 'more content')
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
		it('parses single-line options on a normal bullet list item', () => {
			const { parser } = createListItemParser()
			const listItemText = `*{ default value; key2=value2 } list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'bullet')
			assume(result?.lines[0]).toHaveProperty('asText', `*{ default value; key2=value2 } list item`)

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')

			assume(result?.content[0]).toHaveProperty('itemType', 'plain')
			assume(result?.content[0].lines[0]).toHaveProperty('asText', `*{ default value; key2=value2 } list item`)

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		})
		it('parses single-line options on a normal numbered list item', () => {
			const { parser } = createListItemParser()
			const listItemText = `1.{ default value; key2=value2 } list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'ordered')
			assume(result?.lines[0]).toHaveProperty('asText', `1.{ default value; key2=value2 } list item`)

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')

			assume(result?.content[0]).toHaveProperty('itemType', 'plain')
			assume(result?.content[0].lines[0]).toHaveProperty('asText', `1.{ default value; key2=value2 } list item`)

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		})
		it('parses single-line options on a task bullet list item', () => {
			const { parser } = createListItemParser()
			const listItemText = `*{ default value; key2=value2 } [ ] list item`
			const text = `text before\n${listItemText}`
			
			const result = parser.parseLine(null, text, 'text before\n'.length, listItemText.length)

			expect(result).not.toBeNull()
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'bullet')
			assume(result?.lines[0]).toHaveProperty('asText', `*{ default value; key2=value2 } [ ] list item`)

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')

			assume(result?.content[0]).toHaveProperty('itemType', 'task')
			assume(result?.content[0].lines[0]).toHaveProperty('asText', `*{ default value; key2=value2 } [ ] list item`)

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
		})
		it('parses single-line options with indent on a multi-line bullet list item', () => {
			const { parser } = createListItemParser()
			const contents = [
				`*{ default value; key2=value2 }  list item`,
				`   more content`,
			]
			const text = contents.join('\n')
			
			type Result = { i: number, parsed: MfMList | null}
			const result = contents.reduce((prev: Result, current: string): Result => {
				const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
				const parsed = parser.parseLine(previous, text, prev.i, current.length)
				return { parsed, i: prev.i+current.length+1 }
			}, { i: 0, parsed: null }).parsed

			expect(result).not.toBeNull()
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'bullet')
			assume(result?.lines[0]).toHaveProperty('asText', `*{ default value; key2=value2 }  list item`)

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('indent', 3)
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')

			assume(result?.content[0]).toHaveProperty('itemType', 'plain')
			contents.forEach((c, i) => assume(result?.content[0].lines[i]).toHaveProperty('asText', c))

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
			assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
		})
		it('parses multi-line options on a normal bullet list item', () => {
			const { parser } = createListItemParser()
			const contents = [
				`*{ default value; key2=value2;`,
				`    key3=value3 }   list item`,
				`    more content`,
			]
			const text = contents.join('\n')
			
			type Result = { i: number, parsed: MfMList | null}
			const result = contents.reduce((prev: Result, current: string): Result => {
				const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
				const parsed = parser.parseLine(previous, text, prev.i, current.length)
				return { parsed, i: prev.i+current.length+1 }
			}, { i: 0, parsed: null }).parsed

			expect(result).not.toBeNull()
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'bullet')
			assume(result?.lines).toHaveLength(3)
			contents.forEach((c, i) => assume(result?.lines[i]).toHaveProperty('asText', c))

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('indent', 4)
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')
			expect(result?.content[0].options.get('key3')).toEqual('value3')

			assume(result?.content[0]).toHaveProperty('itemType', 'plain')
			contents.forEach((c, i) => assume(result?.content[0].lines[i]).toHaveProperty('asText', c))

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
			assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
		})
		it('parses multi-line options on a normal numbered list item', () => {
			const { parser } = createListItemParser()
			const contents = [
				`3.{ default value; key2=value2;`,
				`    key3=value3 }   list item`,
				`     more content`,
			]
			const text = contents.join('\n')
			
			type Result = { i: number, parsed: MfMList | null}
			const result = contents.reduce((prev: Result, current: string): Result => {
				const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
				const parsed = parser.parseLine(previous, text, prev.i, current.length)
				return { parsed, i: prev.i+current.length+1 }
			}, { i: 0, parsed: null }).parsed

			expect(result).not.toBeNull()
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'ordered')
			assume(result?.lines).toHaveLength(3)
			contents.forEach((c, i) => assume(result?.lines[i]).toHaveProperty('asText', c))

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('indent', 5)
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')
			expect(result?.content[0].options.get('key3')).toEqual('value3')

			assume(result?.content[0]).toHaveProperty('itemType', 'plain')
			contents.forEach((c, i) => assume(result?.content[0].lines[i]).toHaveProperty('asText', c))

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
			assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
		})
		it('parses multi-line options on a task bullet list item', () => {
			const { parser } = createListItemParser()
			const contents = [
				`*{ default value; key2=value2;`,
				`    key3=value3 } [x]  list item`,
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
			assume(result).toHaveProperty('type', 'list')
			assume(result).toHaveProperty('listType', 'bullet')
			assume(result?.lines).toHaveLength(3)
			contents.forEach((c, i) => assume(result?.lines[i]).toHaveProperty('asText', c))

			assume(result?.content).toHaveLength(1)
			assume(result?.content[0]).toHaveProperty('type', 'list-item')
			expect(result?.content[0]).toHaveProperty('indent', 2)
			expect(result?.content[0].options.get('default')).toEqual('default value')
			expect(result?.content[0].options.get('key2')).toEqual('value2')
			expect(result?.content[0].options.get('key3')).toEqual('value3')

			assume(result?.content[0]).toHaveProperty('itemType', 'task')
			assume(result?.content[0]).toHaveProperty('taskState', 'x')
			contents.forEach((c, i) => assume(result?.content[0].lines[i]).toHaveProperty('asText', c))

			assume(result?.content[0].content).toHaveLength(1)
			assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
			assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
			assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
		})
	})
	describe('parsing updates', () => {
		describe('single-line', () => {
			it('parses update to single-line list item, changing the content', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const text = `* list item`
				
				const original = parser.parseLine(null, text, 0, text.length) as MfMList
				const result = updateParser.parse(original, { text: ' (updated)', rangeOffset: '* list item'.length, rangeLength: 0 }) as MfMList
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `* list item (updated)`)
	
				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `* list item (updated)`)
	
				expect(result?.content[0].content).toHaveLength(1)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item (updated)')
			})
			it('parses update to single-line list item with options, changing the content', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const text = `*{ key1=value1; key2=value2; } list item`
				
				const original = parser.parseLine(null, text, 0, text.length) as MfMList
				const result = updateParser.parse(original, { text: ' (updated)', rangeOffset: '*{ key1=value1; key2=value2; } list item'.length, rangeLength: 0 }) as MfMList
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `*{ key1=value1; key2=value2; } list item (updated)`)
	
				expect(result.options.get('key1')).toEqual('value1')
				expect(result.options.get('key2')).toEqual('value2')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `*{ key1=value1; key2=value2; } list item (updated)`)
	
				expect(result?.content[0].content).toHaveLength(1)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item (updated)')
			})
			it('parses update to single-line list item with options, changing the options', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const text = `*{ key1=value1; key2=value2; } list item`
				
				const original = parser.parseLine(null, text, 0, text.length) as MfMList
				const result = updateParser.parse(original, { text: '', rangeOffset: '*{ key1=value1; key2=val'.length, rangeLength: 2 }) as MfMList
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `*{ key1=value1; key2=val2; } list item`)
	
				expect(result.options.get('key1')).toEqual('value1')
				expect(result.options.get('key2')).toEqual('val2')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `*{ key1=value1; key2=val2; } list item`)
	
				expect(result?.content[0].content).toHaveLength(1)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
			})
			it('does not parse update that changes the marker', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const text = `*{ key1=value1; key2=value2; } list item`
				
				const original = parser.parseLine(null, text, 0, text.length) as MfMList
				const result = updateParser.parse(original, { text: '+', rangeOffset: 0, rangeLength: 1 }) as MfMList
	
				expect(result).toBeNull()
			})
		})
		describe('multi-line', () => {
			it('updates the first line of a multi-line list item', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const contents = [
					`1. [x]  list item`,
					`   more content`,
					`   last line`,
				]
				const text = contents.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = contents.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: ' (updated)', rangeOffset: '1. [x]  list item'.length, rangeLength: 0 }) as MfMList
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'ordered')
				expect(result?.lines).toHaveLength(3)
				expect(result.lines[0]).toHaveProperty('asText', '1. [x]  list item (updated)')
				expect(result.lines[1]).toHaveProperty('asText', contents[1])
				expect(result.lines[2]).toHaveProperty('asText', contents[2])

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('indent', 3)

				assume(result?.content[0]).toHaveProperty('itemType', 'task')
				assume(result?.content[0]).toHaveProperty('taskState', 'x')
				expect(result.lines[0]).toHaveProperty('asText', '1. [x]  list item (updated)')
				expect(result.lines[1]).toHaveProperty('asText', contents[1])
				expect(result.lines[2]).toHaveProperty('asText', contents[2])

				assume(result?.content[0].content).toHaveLength(1)
				assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item (updated)')
				assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
				assume(result?.content[0].content[0].lines[2]).toHaveProperty('asText', 'last line')
			})
			it('updates the last line of a multi-line list item', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const contents = [
					`1. list item`,
					`   more content`,
					`   last line`,
				]
				const text = contents.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = contents.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: ' (updated)', rangeOffset: text.length, rangeLength: 0 }) as MfMList
	
				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'ordered')
				expect(result?.lines).toHaveLength(3)
				expect(result.lines[0]).toHaveProperty('asText', contents[0])
				expect(result.lines[1]).toHaveProperty('asText', contents[1])
				expect(result.lines[2]).toHaveProperty('asText', '   last line (updated)')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('indent', 3)

				assume(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result.lines[0]).toHaveProperty('asText', contents[0])
				expect(result.lines[1]).toHaveProperty('asText', contents[1])
				expect(result.lines[2]).toHaveProperty('asText', '   last line (updated)')

				assume(result?.content[0].content).toHaveLength(1)
				assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
				assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
				assume(result?.content[0].content[0].lines[2]).toHaveProperty('asText', 'last line (updated)')
			})

			it('updates multi-line list item with options: first line after closed options block', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const lines = [
					`3.{ default value; key2=value2;`,
					`    key3=value3 }   list item`,
					`     more content`,
				]
				const text = lines.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = lines.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: ' (updated)', rangeOffset: lines[0].length+1+lines[1].length, rangeLength: 0 }) as MfMList

				expect(result).not.toBeNull()
				assume(result).toHaveProperty('type', 'list')
				assume(result).toHaveProperty('listType', 'ordered')
				assume(result?.lines).toHaveLength(3)
				expect(result?.lines[0]).toHaveProperty('asText', lines[0])
				expect(result?.lines[1]).toHaveProperty('asText', `    key3=value3 }   list item (updated)`)
				expect(result?.lines[2]).toHaveProperty('asText', lines[2])
				
				assume(result?.content).toHaveLength(1)
				assume(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('indent', 5)
				expect(result?.content[0].options.get('default')).toEqual('default value')
				expect(result?.content[0].options.get('key2')).toEqual('value2')
				expect(result?.content[0].options.get('key3')).toEqual('value3')
	
				assume(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', lines[0])
				expect(result?.content[0].lines[1]).toHaveProperty('asText', `    key3=value3 }   list item (updated)`)
				expect(result?.content[0].lines[2]).toHaveProperty('asText', lines[2])
	
				assume(result?.content[0].content).toHaveLength(1)
				assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item (updated)')
				assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
			})
			it('updates multi-line list item with options: second line after closed options block', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const lines = [
					`3.{ default value; key2=value2;`,
					`    key3=value3 }   list item`,
					`     more content`,
				]
				const text = lines.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = lines.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: '(updated) ', rangeOffset: lines[0].length+1+lines[1].length+1+`     more `.length, rangeLength: 0 }) as MfMList

				expect(result).not.toBeNull()
				assume(result).toHaveProperty('type', 'list')
				assume(result).toHaveProperty('listType', 'ordered')
				assume(result?.lines).toHaveLength(3)
				expect(result?.lines[0]).toHaveProperty('asText', lines[0])
				expect(result?.lines[1]).toHaveProperty('asText', lines[1])
				expect(result?.lines[2]).toHaveProperty('asText', `     more (updated) content`)
				
				assume(result?.content).toHaveLength(1)
				assume(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('indent', 5)
				expect(result?.content[0].options.get('default')).toEqual('default value')
				expect(result?.content[0].options.get('key2')).toEqual('value2')
				expect(result?.content[0].options.get('key3')).toEqual('value3')
	
				assume(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', lines[0])
				expect(result?.content[0].lines[1]).toHaveProperty('asText', lines[1])
				expect(result?.content[0].lines[2]).toHaveProperty('asText', `     more (updated) content`)
	
				assume(result?.content[0].content).toHaveLength(1)
				assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
				assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more (updated) content')
			})
			it('updates multi-line list item with options: first options line in closed options block', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const lines = [
					`3.{ default value; key2=value2;`,
					`    key3=value3 }   list item`,
					`     more content`,
				]
				const text = lines.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = lines.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: '', rangeOffset: '3.{ default value; key2=val'.length, rangeLength: 2 }) as MfMList

				expect(result).not.toBeNull()
				assume(result).toHaveProperty('type', 'list')
				assume(result).toHaveProperty('listType', 'ordered')
				assume(result?.lines).toHaveLength(3)
				expect(result?.lines[0]).toHaveProperty('asText', '3.{ default value; key2=val2;')
				expect(result?.lines[1]).toHaveProperty('asText', lines[1])
				expect(result?.lines[2]).toHaveProperty('asText', lines[2])
				
				assume(result?.content).toHaveLength(1)
				assume(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('indent', 5)
				expect(result?.content[0].options.get('default')).toEqual('default value')
				expect(result?.content[0].options.get('key2')).toEqual('val2')
				expect(result?.content[0].options.get('key3')).toEqual('value3')
	
				assume(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', '3.{ default value; key2=val2;')
				expect(result?.content[0].lines[1]).toHaveProperty('asText', lines[1])
				expect(result?.content[0].lines[2]).toHaveProperty('asText', lines[2])
	
				assume(result?.content[0].content).toHaveLength(1)
				assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
				assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
			})
			it('updates multi-line list item with options: second options line in closed options block', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const lines = [
					`3.{ default value; key2=value2;`,
					`    key3=value3 }   list item`,
					`     more content`,
				]
				const text = lines.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = lines.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: '', rangeOffset: lines[0].length+1+'    key3=val'.length, rangeLength: 2 }) as MfMList

				expect(result).not.toBeNull()
				assume(result).toHaveProperty('type', 'list')
				assume(result).toHaveProperty('listType', 'ordered')
				assume(result?.lines).toHaveLength(3)
				expect(result?.lines[0]).toHaveProperty('asText', lines[0])
				expect(result?.lines[1]).toHaveProperty('asText', `    key3=val3 }   list item`)
				expect(result?.lines[2]).toHaveProperty('asText', lines[2])
				
				assume(result?.content).toHaveLength(1)
				assume(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('indent', 5)
				expect(result?.content[0].options.get('default')).toEqual('default value')
				expect(result?.content[0].options.get('key2')).toEqual('value2')
				expect(result?.content[0].options.get('key3')).toEqual('val3')
	
				assume(result?.content[0]).toHaveProperty('itemType', 'plain')
				expect(result?.content[0].lines[0]).toHaveProperty('asText', lines[0])
				expect(result?.content[0].lines[1]).toHaveProperty('asText', `    key3=val3 }   list item`)
				expect(result?.content[0].lines[2]).toHaveProperty('asText', lines[2])
	
				assume(result?.content[0].content).toHaveLength(1)
				assume(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				assume(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item')
				assume(result?.content[0].content[0].lines[1]).toHaveProperty('asText', 'more content')
			})
			it('updates multi-line list item with options: second line of an unclosed options block', () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const lines = [
					`3.{ default value; key2=value2;`,
					`    key3=value3`,
				]
				const text = lines.join('\n')
				
				type Result = { i: number, parsed: MfMList | null}
				const original = lines.reduce((prev: Result, current: string): Result => {
					const previous = prev.parsed?.content[prev.parsed.content.length-1] ?? null
					const parsed = parser.parseLine(previous, text, prev.i, current.length)
					return { parsed, i: prev.i+current.length+1 }
				}, { i: 0, parsed: null }).parsed as MfMList
				const result = updateParser.parse(original, { text: '', rangeOffset: lines[0].length+1+'    key3=val'.length, rangeLength: 2 }) as MfMList

				expect(result).toBeNull()
			})
		})

		describe('updating task list', () => {
			[
				['[ ]', '[x]', 'x', ['x', 3, 1]] as const,
				['[x]', '[ ]', ' ', [' ', 3, 1]] as const,
				['[]', '[x]', 'x', ['x', 3, 0]] as const,
				['[x]', '[]', ' ', ['', 3, 1]] as const,
				['[x]', '[i]', 'i', ['i', 3, 1]] as const,
			].forEach(([from, to, type, [insert, offset, length]]) => it(`updates task list from "${from}" to "${to}" resulting in type "${type}"`, () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const text = `* ${from} list item`
				
				const original = parser.parseLine(null, text, 0, text.length) as MfMList
				const result = updateParser.parse(original, { text: insert, rangeOffset: offset, rangeLength: length }) as MfMList
	
				expect(result).toBeNull()
				//These tests result in "null", since dynamic lines cannot be
				//updated (for now). The following would be nicer, but then
				//the parser would have to be able to update attachments within
				//dynamic lines (hard, but probably doable):
				
				/*
				expect(result).toHaveProperty('type', 'list')
				expect(result).toHaveProperty('listType', 'bullet')
				expect(result?.lines[0]).toHaveProperty('asText', `* ${to} list item`)
	
				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'list-item')
				expect(result?.content[0]).toHaveProperty('itemType', 'task')
				expect(result?.content[0]).toHaveProperty('taskState', type)
				expect(result?.content[0].lines[0]).toHaveProperty('asText', `* ${to} list item`)
	
				expect(result?.content[0].content).toHaveLength(1)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'paragraph')
				expect(result?.content[0].content[0].lines[0]).toHaveProperty('asText', 'list item_')
				*/
			}));

			[
				['', '[]',      ['[]', 2, 0]] as const,
				['[', '[x]',    ['x]', 3, 0]] as const,
				['[x]', '[x',   ['', 4, 1]] as const,
				['[  ]', '[ ]', ['', 3, 1]] as const,
				['[ ]', '[  ]', [' ', 3, 0]] as const,
			].forEach(([from, to, [insert, offset, length]]) => it(`does not update list from "${from}" to "${to}"`, () => {
				const { parser } = createListItemParser()
				const updateParser = new UpdateParser(new NumberedIdGenerator())
				const text = `* ${from} list item`
				
				const original = parser.parseLine(null, text, 0, text.length) as MfMList
				const result = updateParser.parse(original, { text: insert, rangeOffset: offset, rangeLength: length }) as MfMList
	
				expect(result).toBeNull()
			}));
		})
	})
})
