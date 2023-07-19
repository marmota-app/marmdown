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

import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { UpdateParser } from "$markdown/UpdateParser"
import { MfMThematicBreak, MfMThematicBreakParser } from "$mfm/block/MfMThematicBreak"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { Parsers } from "$parser/Parsers"
import { createOptionsParser } from "../options/createOptionsParser"

describe('MfMThematicBreak parser', () => {
	function createThematicBreakParser() {
		const idGenerator = new NumberedIdGenerator()
		const optionsParser = createOptionsParser(idGenerator)
		const parsers: Parsers<MfMOptionsParser> = {
			idGenerator,
			'MfMOptions': optionsParser,
		}
		const parser = new MfMThematicBreakParser(parsers)
		return { parser }
	}
	describe('parsing the content', () => {
		[ '*', '-', '_', ].forEach(token => {
			it(`parses three consecutive "${token}" as thematic break`, () => {
				const { parser } = createThematicBreakParser()

				const text = `${token}${token}${token}`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'thematic-break')
			})
			it(`does not parse two consecutive ${token}`, () => {
				const { parser } = createThematicBreakParser()

				const text = `${token}${token}`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).toBeNull()
			})
		})
		it('does not parse thematic break when previous is not null', () => {
			const { parser } = createThematicBreakParser()

			const text = `___`
			const previous = parser.parseLine(null, text, 0, text.length)
			const result = parser.parseLine(previous, text, 0, text.length)

			expect(result).toBeNull()
		});
		[' ', '  ', '   '].forEach(spaces => it(`parses a thematic break indented by ${spaces.length} spaces`, () => {
			const { parser } = createThematicBreakParser()

			const text = `${spaces}___`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'thematic-break')
		}))
		it(`does not parse a thematic break indented by four spaces`, () => {
			const { parser } = createThematicBreakParser()

			const text = `    ___`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).toBeNull()
		})
		it(`parses a thematic break with whitespace at the end`, () => {
			const { parser } = createThematicBreakParser()

			const text = `___  \t   \t`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'thematic-break')
		})
		it(`does not parse a thematic break with non-whitespace at the end`, () => {
			const { parser } = createThematicBreakParser()

			const text = `___  \t   a\t`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).toBeNull()
		})
		it(`parses a thematic break with whitespace in between`, () => {
			const { parser } = createThematicBreakParser()

			const text = `_   _\t \t_`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'thematic-break')
		});
		['****', '  *****   \t ', '***  ***\t***    ** \t *'].forEach(token => it(`parses token "${token}"`, () => {
			const { parser } = createThematicBreakParser()

			const text = token
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'thematic-break')
		}))
	})

	describe('parsing options', () => {
		it('parses thematic break with options', () => {
			const { parser } = createThematicBreakParser()

			const text = `***{key1=value1}`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'thematic-break')
			expect(result?.options).not.toBeNull()
			expect(result?.options.get('key1')).toEqual('value1')
		})
		it('parses thematic break with multi-line options', () => {
			const { parser } = createThematicBreakParser()

			const line1 = `***{key1=value1`
			const line2 = `key2=value2}`
			const text = `${line1}\n${line2}`
			const first = parser.parseLine(null, text, 0, line1.length)
			const result = parser.parseLine(first, text, line1.length+1, line2.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'thematic-break')
			expect(result?.options).not.toBeNull()
			expect(result?.options.get('key1')).toEqual('value1')
			expect(result?.options.get('key2')).toEqual('value2')
		})
		it('does not parse thematic break with options and characters after the options', () => {
			const { parser } = createThematicBreakParser()

			const text = `***{key1=value1} illegal`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).toBeNull()
		})
		it('does not parse thematic break with options and characters after the options', () => {
			const { parser } = createThematicBreakParser()

			const line1 = `***{key1=value1`
			const line2 = `key2=value2} illegal`
			const text = `${line1}\n${line2}`
			const first = parser.parseLine(null, text, 0, line1.length)
			const result = parser.parseLine(first, text, line1.length+1, line2.length)

			expect(result).toBeNull()
		})
	})

	describe('parsing the content lines', () => {
		[ '*', '-', '_', ].forEach(token => {
			it(`parses the line content for three consecutive "${token}"`, () => {
				const { parser } = createThematicBreakParser()

				const text = `${token}${token}${token}`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0].asText).toEqual(text)
			})
		})
		it('parses the line content for a thematic break with whitespace at the end', () => {
			const { parser } = createThematicBreakParser()

			const content = ' * * *'
			const whitespace = '   \t  '
			const text = `${content}${whitespace}`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0].asText).toEqual(text)

			expect(result?.lines[0].content).toHaveLength(2)
			expect(result?.lines[0].content[0].asText).toEqual(content)
			expect(result?.lines[0].content[1].asText).toEqual(whitespace)
		})
		it('parses the line content of thematic break with options', () => {
			const { parser } = createThematicBreakParser()

			const text = `***{key1=value1}  \t`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0].asText).toEqual(text)
		})
		it('parses the line content of thematic break with multi-line options', () => {
			const { parser } = createThematicBreakParser()

			const line1 = `***{key1=value1;\t`
			const line2 = `key2=value2} \t  `
			const text = `${line1}\n${line2}`
			const first = parser.parseLine(null, text, 0, line1.length)
			const result = parser.parseLine(first, text, line1.length+1, line2.length)

			expect(result).not.toBeNull()
			expect(result?.lines).toHaveLength(2)
			expect(result?.lines[0].asText).toEqual(line1)
			expect(result?.lines[1].asText).toEqual(line2)
		})
	})

	describe('parsing updates', () => {
		[['***'], ['***{key=value}'], ['***{key1=value1', 'key2=value2}']].forEach(lines => {
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			function parseLines(_lines: string[] = lines) {
				const { parser } = createThematicBreakParser()

				const text = _lines.join('\n')
				const result = _lines.reduce((r: [ MfMThematicBreak | null, number], c: string): [ MfMThematicBreak | null, number] => {
					return [ parser.parseLine(r[0], text, r[1], c.length), r[1]+c.length+1 ]
				}, [ null, 0, ])[0]
				expect(result).not.toBeNull()

				return { text, result: result as MfMThematicBreak, }
			}

			it(`returns thematic break when adding a token to "${lines.join('\\n')}"`, () => {
				const { result } = parseLines()
				const updated = updateParser.parse(result, { text: '*', rangeOffset: 0, rangeLength: 0 })

				expect(updated).not.toBeNull()
				expect(updated?.lines.length).toEqual(result.lines.length)
				updated?.lines.forEach((line, i) => expect(line.asText).toEqual((i===0? '*' : '')+lines[i]))
			})
			it(`returns thematic break when adding a whitespace at the beginning to "${lines.join('\\n')}"`, () => {
				const { result } = parseLines()
				const updated = updateParser.parse(result, { text: ' ', rangeOffset: 0, rangeLength: 0 })

				expect(updated).toBeNull() //Might change document structure!
			})
			it(`returns thematic break when adding a whitespace at the end to "${lines.join('\\n')}"`, () => {
				const { text, result, } = parseLines()
				const updated = updateParser.parse(result, { text: ' ', rangeOffset: text.length, rangeLength: 0 })

				if(lines.length > 1) {
					//Cannot update the second line of a two-line thematic break, because this would only parse
					//a part of text inside / after the options
					expect(updated).toBeNull()
				} else {
					expect(updated).not.toBeNull()
					expect(updated?.lines.length).toEqual(result.lines.length)
					updated?.lines.forEach((line, i) => expect(line.asText).toEqual(lines[i]+(i===lines.length-1? ' ' : '')))	
				}
			})
			it(`returns thematic break when removing a whitespace at the end from "${lines.join('\\n')}"`, () => {
				const { text, result, } = parseLines(lines.map(l => l + '   '))
				const updated = updateParser.parse(result, { text: '', rangeOffset: text.length-1, rangeLength: 1 })

				if(lines.length > 1) {
					//Cannot update the second line of a two-line thematic break, becaus this would only parse
					//a part of text inside / after the options
					expect(updated).toBeNull()
				} else {
					expect(updated).not.toBeNull()
					expect(updated?.lines.length).toEqual(result.lines.length)
					updated?.lines.forEach((line, i) => expect(line.asText).toEqual(lines[i]+'  '))
				}
			})
			it(`returns thematic break when removing a token from a long break from "${lines.join('\\n')}"`, () => {
				const { text, result, } = parseLines(lines.map((l, i) => i===0? '***'+l: l))
				const updated = updateParser.parse(result, { text: '', rangeOffset: 0, rangeLength: 1 })

				expect(updated).not.toBeNull()
				expect(updated?.lines.length).toEqual(result.lines.length)
				updated?.lines.forEach((line, i) => expect(line.asText).toEqual(i===0? '**'+lines[i] : lines[i]))
			})
			it(`returns null when removing a token from a 3-long break from "${lines.join('\\n')}"`, () => {
				const { text, result, } = parseLines()
				const updated = updateParser.parse(result, { text: '', rangeOffset: 0, rangeLength: 1 })

				expect(updated).toBeNull()
			})
			it(`returns null when adding a character at the end to "${lines.join('\\n')}"`, () => {
				const { text, result, } = parseLines()
				const updated = updateParser.parse(result, { text: 'a', rangeOffset: text.length, rangeLength: 0 })

				expect(updated).toBeNull()
			})
			it(`returns null when adding four whitespace at the beginning to "${lines.join('\\n')}"`, () => {
				const { text, result, } = parseLines()
				const updated = updateParser.parse(result, { text: '    ', rangeOffset: 0, rangeLength: 0 })

				expect(updated).toBeNull()
			})
		})
	})
})
