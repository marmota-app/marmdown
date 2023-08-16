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

import { Element, LineContent, ParsedLine } from "../../../src/element/Element";
import { TextSpan } from "../../../src/element/TextSpan";
import { NumberedIdGenerator } from "../../../src/IdGenerator";
import { UpdateParser } from "../../../src/UpdateParser";
import { MfMEmphasis } from "../../../src/mfm/inline/MfMEmphasis";
import { createEmphasisParser } from "./createEmphasisParser";

describe('MfMEmphasis', () => {

	describe('parsing the content', () => {
		describe('finding left-flanking delimiter runs', () => {
			['_', '__', '___', '____', '*', '*****', '~', '~~', '~~~~~'].forEach(delimiters => {
				it(`finds ../../../src/{delimiters} as part of a left delimiter run at the start of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before ../../../src/{delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

					expect(result).toHaveProperty('start', 'text before '.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`finds ../../../src/{delimiters} as part of a left delimiter run in the middle of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before ../../../src/{delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before '.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ../../../src/{delimiters} as part of a left delimiter run at the end of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before ../../../src/{delimiters}`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`does not find ../../../src/{delimiters} as part of a left delimiter run before whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before ../../../src/{delimiters} abc`

					const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

					expect(result).toBeNull()
				})
				it(`finds ../../../src/{delimiters} as part of a left delimiter run preceided by text`, () => {
					const parser = createEmphasisParser()
					const text = `text before../../../src/{delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ../../../src/{delimiters} as part of a left delimiter run before punctuation`, () => {
					const parser = createEmphasisParser()
					const text = `text before../../../src/{delimiters}.abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ../../../src/{delimiters} as part of a left delimiter run before punctuation preceided by whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before\t../../../src/{delimiters}.abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before\t'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
			})

			it('returns start of the delimiter run even when parsing starts in the middle of the run', () => {
				const parser = createEmphasisParser()
				const text = `text before ***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before **'.length, text.length-'text before **'.length)

				expect(result).toHaveProperty('start', 'text before **'.length)
				expect(result).toHaveProperty('length', 1)
				expect(result).toHaveProperty('character', '*')

				expect(result).toHaveProperty('runStart', 'text before '.length)
				expect(result).toHaveProperty('runLength', 3)
			})

			it('returns info that the found delimiter run is a left-flanking delimiter run', () => {
				const parser = createEmphasisParser()
				const text = `text before ***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before **'.length, text.length-'text before **'.length)

				expect(result).toHaveProperty('isLeftFlanking', true)
				expect(result).toHaveProperty('isRightFlanking', false)
			})

			it(`finds shorter run with \\*** as part of a left delimiter run at the start of the line`, () => {
				const parser = createEmphasisParser()
				const text = `text before \\***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before \\*'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
			it(`finds shorter run with \\*\\** as part of a left delimiter run at the start of the line`, () => {
				const parser = createEmphasisParser()
				const text = `text before \\*\\**abc`

				const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before \\*\\*'.length)
				expect(result).toHaveProperty('length', 1)
				expect(result).toHaveProperty('character', '*')
			})
			it(`finds shorter run with **\\*** as part of a left delimiter run at the start of the line`, () => {
				const parser = createEmphasisParser()
				const text = `text before**\\***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before'.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
			it(`finds delimiter run with **\\ in the middle of the line (to be able to escape options start)`, () => {
				const parser = createEmphasisParser()
				const text = `content**\\`

				const result = parser.findLeftDelimiterRun(text, 0, text.length)

				expect(result).toHaveProperty('start', 'content'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
			it(`finds delimiter run with __{ in the middle of the line (because we need to support options)`, () => {
				const parser = createEmphasisParser()
				const text = `content__{`

				const result = parser.findLeftDelimiterRun(text, 0, text.length)

				expect(result).toHaveProperty('start', 'content'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '_')
			})
		})

		describe('finding right-flanking delimiter runs', () => {
			['_', '__', '___', '____', '*', '*****', '~', '~~', '~~~~~'].forEach(delimiters => {
				it(`does not find ../../../src/{delimiters} as part of a right delimiter run at the start of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before\n../../../src/{delimiters} text after`

					const result = parser.findRightDelimiterRun(text, 'text before\n'.length, text.length-'text before\n'.length)

					expect(result).toBeNull()
				})
				it(`finds ../../../src/{delimiters} as part of a right delimiter run in the middle of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before../../../src/{delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`finds ../../../src/{delimiters} as part of a right delimiter run at the end of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before../../../src/{delimiters}`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ../../../src/{delimiters} as part of a right delimiter run after whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before ../../../src/{delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ../../../src/{delimiters} as part of a right delimiter run followed by text`, () => {
					const parser = createEmphasisParser()
					const text = `text before../../../src/{delimiters}abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ../../../src/{delimiters} as part of a right delimiter run after punctuation`, () => {
					const parser = createEmphasisParser()
					const text = `text before.../../../src/{delimiters}abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ../../../src/{delimiters} as part of a right delimiter run after punctuation followed by whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before.../../../src/{delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before.'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
			})

			it('returns start of the delimiter run even when parsing starts in the middle of the run', () => {
				const parser = createEmphasisParser()
				const text = `text before abc****`

				const result = parser.findRightDelimiterRun(text, 'text before abc**'.length, text.length-'text before abc**'.length)

				expect(result).toHaveProperty('start', 'text before abc**'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')

				expect(result).toHaveProperty('runStart', 'text before abc'.length)
				expect(result).toHaveProperty('runLength', 4)
			})

			it('returns info that the found delimiter run is a right-flanking delimiter run', () => {
				const parser = createEmphasisParser()
				const text = `text before abc**** text after`

				const result = parser.findRightDelimiterRun(text, 'text before abc**'.length, text.length-'text before abc**'.length)

				expect(result).toHaveProperty('isLeftFlanking', false)
				expect(result).toHaveProperty('isRightFlanking', true)
			})

			it('returns info that the found delimiter run is both right-flanking and left-flanking', () => {
				const parser = createEmphasisParser()
				const text = `text before abc****text after`

				const result = parser.findRightDelimiterRun(text, 'text before abc**'.length, text.length-'text before abc**'.length)

				expect(result).toHaveProperty('isLeftFlanking', true)
				expect(result).toHaveProperty('isRightFlanking', true)
			})

			it(`finds right delimiter run with **\\* as part of a left delimiter run at the end of the line`, () => {
				const parser = createEmphasisParser()
				const text = `text before abc**\\*`

				const result = parser.findRightDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before abc'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
			it(`does not find right delimiter run with \\***`, () => {
				const parser = createEmphasisParser()
				const text = `text before abc\\***def`

				const result = parser.findRightDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toBeNull()
			})
			it(`finds right delimiter run at the end of the line even when the search starts in the middle of the run`, () => {
				const parser = createEmphasisParser()
				const text = `line content___\nnext line`

				const result = parser.findRightDelimiterRun(text, 'line content__'.length, 1)

				expect(result).toHaveProperty('start', 'line content__'.length)
				expect(result).toHaveProperty('length', 1)
				expect(result).toHaveProperty('character', '_')
			})
			it(`does not find right delimiter run at the start of the line even when the search starts in the middle of the run`, () => {
				const parser = createEmphasisParser()
				const text = `text before__\n_\nnext line`

				const result = parser.findRightDelimiterRun(text, 'text before__\n'.length, 1)

				expect(result).toBeNull()
			})
		});

		[['_', '*'], ['*', '_']].forEach(([token, otherToken]) => {
			describe('parse emphasis', () => {
				it('parses simple emphasis', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}emphazised../../../src/{token}`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'emphasis')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')
				})
				it('does not parse emphasis when the text does not contain a left-flanking delimiter run', () => {
					const parser = createEmphasisParser()
					const text = `not emphazised../../../src/{token} also not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).toBeNull()
				})
				it('parses emphasis until the closing delimiter', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}emphazised../../../src/{token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'emphasis')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `../../../src/{token}emphazised../../../src/{token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
					expect(result?.lines[0].content[2]).toHaveProperty('asText', token)
				})
				it('parses emphasis until the closing delimiter, with other delimiters in-between', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}some../../../src/{otherToken} emphazised../../../src/{token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'emphasis')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `some../../../src/{otherToken} emphazised`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `../../../src/{token}some../../../src/{otherToken} emphazised../../../src/{token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some../../../src/{otherToken} emphazised`)
					expect(result?.lines[0].content[2]).toHaveProperty('asText', token)
				})
			})
			describe('parse strong emphasis', () => {
				it('parses simple strong emphasis', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}../../../src/{token}emphazised../../../src/{token}../../../src/{token}`
					const result = parser.parseLine(null, text, 0, text.length)

					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')

					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')

					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
				})
				it('does not parse strong emphasis when the text does not contain a left-flanking delimiter run', () => {
					const parser = createEmphasisParser()
					const text = `not emphazised../../../src/{token}../../../src/{token} also not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).toBeNull()
				})
				it('parses strong emphasis until the closing delimiter', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}../../../src/{token}emphazised../../../src/{token}../../../src/{token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}emphazised../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
				})
				it('parses strong emphasis until the closing delimiter, with other delimiters (right-flanking) in-between', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}../../../src/{token}some../../../src/{otherToken}../../../src/{otherToken} emphazised../../../src/{token}../../../src/{token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `some../../../src/{otherToken}../../../src/{otherToken} emphazised`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}some../../../src/{otherToken}../../../src/{otherToken} emphazised../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some../../../src/{otherToken}../../../src/{otherToken} emphazised`)
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
				})
				it('parses strong emphasis until the closing delimiter, with other delimiters (left-flanking) in-between', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}../../../src/{token}some ../../../src/{otherToken}../../../src/{otherToken}emphazised../../../src/{token}../../../src/{token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')
	
					expect(result?.content).toHaveLength(2)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `some `)
					expect(result?.content[1]).toHaveProperty('type', '--text-span--')
					expect(result?.content[1].content).toHaveLength(2)
					expect(result?.content[1].content[0]).toHaveProperty('text', `../../../src/{otherToken}../../../src/{otherToken}`)
					expect(result?.content[1].content[1]).toHaveProperty('text', `emphazised`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}some ../../../src/{otherToken}../../../src/{otherToken}emphazised../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content).toHaveLength(4)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some `)
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `../../../src/{otherToken}../../../src/{otherToken}emphazised`)
					expect(result?.lines[0].content[3]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
				})
			})
			describe('parse text-span', () => {
				it('parses a text-span when the text does not contain a right-flanking delimiter run', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(2)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', token)
					expect(result?.content[1]).toHaveProperty('type', 'text')
					expect(result?.content[1]).toHaveProperty('text', 'not emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'not emphazised')
				})
				it('parses a text-span when there is no matching closing delimiter', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}some not emphazised../../../src/{otherToken} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(2)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', token)
					expect(result?.content[1]).toHaveProperty('type', 'text')
					expect(result?.content[1]).toHaveProperty('text', `some not emphazised../../../src/{otherToken} with more text...`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some not emphazised../../../src/{otherToken} with more text...`)
				})
				it('parses a text-span when the text does not contain a right-flanking delimiter run for strong emphasis', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}../../../src/{token}not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(2)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `../../../src/{token}../../../src/{token}`)
					expect(result?.content[1]).toHaveProperty('type', 'text')
					expect(result?.content[1]).toHaveProperty('text', 'not emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'not emphazised')
				})
				it('parses text-span when the number of closing delimiters for strong emphasis is less than 2', () => {
					const parser = createEmphasisParser()
					const text = `../../../src/{token}../../../src/{token}not emphazised../../../src/{token}`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(2)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `../../../src/{token}../../../src/{token}`)
					expect(result?.content[1]).toHaveProperty('type', 'text')
					expect(result?.content[1]).toHaveProperty('text', `not emphazised../../../src/{token}`)

					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `../../../src/{token}../../../src/{token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `not emphazised../../../src/{token}`)
				})
			})
		})

		describe('parse strike-through emphasis', () => {
			it('parses simple strike-through emphasis', () => {
				const parser = createEmphasisParser()
				const text = `~emphazised~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)
				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~`)
			})
			it('parses simple strike-through emphasis', () => {
				const parser = createEmphasisParser()
				const text = `~~emphazised~~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)
				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~~`)
			})
			it('does not parse strike-through emphasis when the text does not contain a left-flanking delimiter run', () => {
				const parser = createEmphasisParser()
				const text = `not emphazised~~ also not emphazised`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).toBeNull()
			})
			it('parses strike-through emphasis until the closing delimiter', () => {
				const parser = createEmphasisParser()
				const text = `~~emphazised~~ with more text...`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', `~~emphazised~~`)
				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~~`)
			})
			it('parses strike-through emphasis until the closing delimiter, with other delimiters in-between', () => {
				const parser = createEmphasisParser()
				const text = `~some_ emphazised~ with more text...`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'some_ emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', `~some_ emphazised~`)
				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', 'some_ emphazised')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~`)
			})
		})

		describe('mixing emphasis', () => {
			it('creates <em><strong> on "___"', () => {
				const parser = createEmphasisParser()
				const text = `___emphazised___`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'emphasis')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `_`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '__emphazised__')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `_`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `__`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `__`)
			})
			it('creates <strong><strong> on "____"', () => {
				const parser = createEmphasisParser()
				const text = `____emphazised____`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strong')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `__`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '__emphazised__')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `__`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `__`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `__`)
			})
			it('creates <em><strong><strong> on "_____"', () => {
				const parser = createEmphasisParser()
				const text = `_____emphazised_____`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'emphasis')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content).toHaveLength(1)
				expect(result?.content[0].content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `_`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '____emphazised____')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `_`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `__`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', '__emphazised__')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `__`)

				const mostInnerLineContent = innerLineContent?.content[1] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(mostInnerLineContent.content).toHaveLength(3)
				expect(mostInnerLineContent.content[0]).toHaveProperty('asText', `__`)
				expect(mostInnerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(mostInnerLineContent.content[2]).toHaveProperty('asText', `__`)
			})
			it('creates <strong><em> on "**_"', () => {
				const parser = createEmphasisParser()
				const text = `**_emphazised_**`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strong')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'emphasis')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `**`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '_emphazised_')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `**`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `_`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `_`)
			})
			it('creates <del><del> on "~~~"', () => {
				const parser = createEmphasisParser()
				const text = `~~~emphazised~~~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strike-through')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '~~emphazised~~')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `~~`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `~~`)
			})
			it('creates <del><del> on "~~~~"', () => {
				const parser = createEmphasisParser()
				const text = `~~~~emphazised~~~~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strike-through')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '~~emphazised~~')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~~`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `~~`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `~~`)
			})
			it('creates <del><em> on "~~_"', () => {
				const parser = createEmphasisParser()
				const text = `~~_emphazised_~~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'emphasis')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '_emphazised_')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~~`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `_`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `_`)
			})
			it('creates <del><strong> on "~~__"', () => {
				const parser = createEmphasisParser()
				const text = `~~__emphazised__~~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '__emphazised__')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~~`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `__`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `__`)
			})
			it('creates <del><em><strong> on "~~___"', () => {
				const parser = createEmphasisParser()
				const text = `~~___emphazised___~~`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strike-through')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'emphasis')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `~~`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '___emphazised___')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `~~`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `_`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', '__emphazised__')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `_`)

				const mostInnerLineContent = innerLineContent.content[1] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(mostInnerLineContent.content).toHaveLength(3)
				expect(mostInnerLineContent.content[0]).toHaveProperty('asText', `__`)
				expect(mostInnerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(mostInnerLineContent.content[2]).toHaveProperty('asText', `__`)
			})
			it('creates <em><del><strong> on "_~**"', () => {
				const parser = createEmphasisParser()
				const text = `_~**emphazised**~_`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'emphasis')

				expect(result?.content).toHaveLength(1)
				expect(result?.content[0]).toHaveProperty('type', 'strike-through')
				expect(result?.content[0].content[0]).toHaveProperty('type', 'strong')
				expect(result?.content[0].content[0].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0].content[0].content[0]).toHaveProperty('text', 'emphazised')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(3)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `_`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', '~**emphazised**~')
				expect(result?.lines[0].content[2]).toHaveProperty('asText', `_`)

				const innerLineContent = result?.lines[0].content[1] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `~`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', '**emphazised**')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `~`)

				const mostInnerLineContent = innerLineContent.content[1] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(mostInnerLineContent.content).toHaveLength(3)
				expect(mostInnerLineContent.content[0]).toHaveProperty('asText', `**`)
				expect(mostInnerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(mostInnerLineContent.content[2]).toHaveProperty('asText', `**`)
			})
			it('creates strong with embedded em', () => {
				const parser = createEmphasisParser()
				const text = `**strong _emphazised_ strong**`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strong')

				expect(result?.content).toHaveLength(3)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'strong ')
				expect(result?.content[1]).toHaveProperty('type', 'emphasis')
				expect(result?.content[1].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[1].content[0]).toHaveProperty('text', 'emphazised')
				expect(result?.content[2]).toHaveProperty('type', 'text')
				expect(result?.content[2]).toHaveProperty('text', ' strong')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(5)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `**`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', `strong `)
				expect(result?.lines[0].content[2]).toHaveProperty('asText', '_emphazised_')
				expect(result?.lines[0].content[3]).toHaveProperty('asText', ` strong`)
				expect(result?.lines[0].content[4]).toHaveProperty('asText', `**`)

				const innerLineContent = result?.lines[0].content[2] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerLineContent.content).toHaveLength(3)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `_`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
				expect(innerLineContent.content[2]).toHaveProperty('asText', `_`)
			})
			it('creates strong with embedded em with embedded del', () => {
				const parser = createEmphasisParser()
				const text = `**strong _emphazised ~strike-through~ emphazised_ strong**`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'strong')

				expect(result?.content).toHaveLength(3)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'strong ')
				expect(result?.content[1]).toHaveProperty('type', 'emphasis')
				expect(result?.content[1].content).toHaveLength(3)
				expect(result?.content[1].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[1].content[0]).toHaveProperty('text', 'emphazised ')
				expect(result?.content[1].content[1]).toHaveProperty('type', 'strike-through')
				expect(result?.content[1].content[1].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[1].content[1].content[0]).toHaveProperty('text', 'strike-through')
				expect(result?.content[1].content[2]).toHaveProperty('type', 'text')
				expect(result?.content[1].content[2]).toHaveProperty('text', ' emphazised')
				expect(result?.content[2]).toHaveProperty('type', 'text')
				expect(result?.content[2]).toHaveProperty('text', ' strong')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(5)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `**`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', `strong `)
				expect(result?.lines[0].content[2]).toHaveProperty('asText', '_emphazised ~strike-through~ emphazised_')
				expect(result?.lines[0].content[3]).toHaveProperty('asText', ` strong`)
				expect(result?.lines[0].content[4]).toHaveProperty('asText', `**`)

				const innerLineContent = result?.lines[0].content[2] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(innerLineContent.content).toHaveLength(5)
				expect(innerLineContent.content[0]).toHaveProperty('asText', `_`)
				expect(innerLineContent.content[1]).toHaveProperty('asText', `emphazised `)
				expect(innerLineContent.content[2]).toHaveProperty('asText', '~strike-through~')
				expect(innerLineContent.content[3]).toHaveProperty('asText', ` emphazised`)
				expect(innerLineContent.content[4]).toHaveProperty('asText', `_`)

				const mostInnerLineContent = innerLineContent.content[2] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, unknown>
				expect(mostInnerLineContent.content).toHaveLength(3)
				expect(mostInnerLineContent.content[0]).toHaveProperty('asText', `~`)
				expect(mostInnerLineContent.content[1]).toHaveProperty('asText', 'strike-through')
				expect(mostInnerLineContent.content[2]).toHaveProperty('asText', `~`)
			})
			it('creates em with embedded del and embedded em next to each other', () => {
				const parser = createEmphasisParser()
				const text = `_outer ~inner del~*inner em* outer_`
				const result = parser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'emphasis')

				expect(result?.content).toHaveLength(4)
				expect(result?.content[0]).toHaveProperty('type', 'text')
				expect(result?.content[0]).toHaveProperty('text', 'outer ')
				expect(result?.content[1]).toHaveProperty('type', 'strike-through')
				expect(result?.content[1].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[1].content[0]).toHaveProperty('text', 'inner del')
				expect(result?.content[2]).toHaveProperty('type', 'emphasis')
				expect(result?.content[2].content[0]).toHaveProperty('type', 'text')
				expect(result?.content[2].content[0]).toHaveProperty('text', 'inner em')
				expect(result?.content[3]).toHaveProperty('type', 'text')
				expect(result?.content[3]).toHaveProperty('text', ' outer')

				expect(result?.lines).toHaveLength(1)
				expect(result?.lines[0]).toHaveProperty('asText', text)

				expect(result?.lines[0].content).toHaveLength(6)
				expect(result?.lines[0].content[0]).toHaveProperty('asText', `_`)
				expect(result?.lines[0].content[1]).toHaveProperty('asText', `outer `)
				expect(result?.lines[0].content[2]).toHaveProperty('asText', '~inner del~')
				expect(result?.lines[0].content[3]).toHaveProperty('asText', '*inner em*')
				expect(result?.lines[0].content[4]).toHaveProperty('asText', ` outer`)
				expect(result?.lines[0].content[5]).toHaveProperty('asText', `_`)

				const innerDelContent = result?.lines[0].content[2] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerDelContent.content).toHaveLength(3)
				expect(innerDelContent.content[0]).toHaveProperty('asText', `~`)
				expect(innerDelContent.content[1]).toHaveProperty('asText', 'inner del')
				expect(innerDelContent.content[2]).toHaveProperty('asText', `~`)

				const innerEmContent = result?.lines[0].content[3] as ParsedLine<Element<unknown, unknown, unknown, unknown>, unknown>
				expect(innerEmContent.content).toHaveLength(3)
				expect(innerEmContent.content[0]).toHaveProperty('asText', `*`)
				expect(innerEmContent.content[1]).toHaveProperty('asText', 'inner em')
				expect(innerEmContent.content[2]).toHaveProperty('asText', `*`)
			})
		})
	})
	describe('parsing options', () => {
		it('parses single-line, empty options', () => {
			const parser = createEmphasisParser()
			const text = `_{} emphazised_`
			const result = parser.parseLine(null, text, 0, text.length) as MfMEmphasis

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'emphasis')

			expect(result?.options).not.toBeNull()
			expect(result?.options.keys).toHaveLength(0)

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0]).toHaveProperty('text', 'emphazised')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', text)
			expect(result?.lines[0].content).toHaveLength(4)
			expect(result?.lines[0].content[0]).toHaveProperty('asText', `_`)
			expect(result?.lines[0].content[1]).toHaveProperty('asText', '{} ')
			expect(result?.lines[0].content[2]).toHaveProperty('asText', 'emphazised')
			expect(result?.lines[0].content[3]).toHaveProperty('asText', `_`)
		})
		it('parses single-line options with values', () => {			const parser = createEmphasisParser()
			const text = `_{ some default value; key2=value2; key3=value3 }emphazised_`
			const result = parser.parseLine(null, text, 0, text.length) as MfMEmphasis

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'emphasis')

			expect(result?.options).not.toBeNull()
			expect(result?.options.get('default')).toEqual('some default value')
			expect(result?.options.get('key2')).toEqual('value2')
			expect(result?.options.get('key3')).toEqual('value3')

			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'text')
			expect(result?.content[0]).toHaveProperty('text', 'emphazised')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', text)
			expect(result?.lines[0].content).toHaveLength(4)
			expect(result?.lines[0].content[0]).toHaveProperty('asText', `_`)
			expect(result?.lines[0].content[1]).toHaveProperty('asText', '{ some default value; key2=value2; key3=value3 }')
			expect(result?.lines[0].content[2]).toHaveProperty('asText', 'emphazised')
			expect(result?.lines[0].content[3]).toHaveProperty('asText', `_`)
		})
	})
	describe('parsing updates', () => {
		it('updates simple emphasis', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '', rangeOffset: 6, rangeLength: 11, })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('type', 'text')
			expect(updated?.content[0]).toHaveProperty('text', 'some text')

			expect(updated?.lines[0].content).toHaveLength(3)
			expect(updated?.lines[0].content[0]).toHaveProperty('asText', '_')
			expect(updated?.lines[0].content[1]).toHaveProperty('asText', 'some text')
			expect(updated?.lines[0].content[2]).toHaveProperty('asText', '_')
		})
		it('does not update simple emphasis when starting delimiter is deleted', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '', rangeOffset: 0, rangeLength: 1, })

			expect(updated).toBeNull()
		})
		it('does not update simple emphasis when ending delimiter is deleted', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '', rangeOffset: '_some emphazised text'.length, rangeLength: 1, })

			expect(updated).toBeNull()
		})
		it('does not update simple emphasis when starting delimiter is added', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '_', rangeOffset: 0, rangeLength: 0, })

			expect(updated).toBeNull()
		})
		it('does not update simple emphasis when ending delimiter is added', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '_', rangeOffset: '_some emphazised text'.length, rangeLength: 0, })

			expect(updated).toBeNull()
		})
		it('does not update emphasis when adding a closing delimiter in the middle, shortening it', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '_', rangeOffset: '_some emphazised'.length, rangeLength: 0, })

			expect(updated).toBeNull()
		})
		it('updates simple emphasis when different starting delimiter is added', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '*', rangeOffset: '_'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('type', '--text-span--')
			expect((updated?.content[0] as TextSpan<any>).content).toHaveLength(2)
			expect((updated?.content[0] as TextSpan<any>).content[0]).toHaveProperty('text', '*')
			expect((updated?.content[0] as TextSpan<any>).content[1]).toHaveProperty('text', 'some emphazised text')

			expect(updated?.lines[0].content).toHaveLength(3)
			expect(updated?.lines[0].content[0]).toHaveProperty('asText', '_')
			expect(updated?.lines[0].content[1]).toHaveProperty('asText', '*some emphazised text')
			expect(updated?.lines[0].content[2]).toHaveProperty('asText', '_')
		})
		it('updates simple emphasis when different ending delimiter is added', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '*', rangeOffset: '_some emphazised text'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('type', 'text')
			expect(updated?.content[0]).toHaveProperty('text', 'some emphazised text*')

			expect(updated?.lines[0].content).toHaveLength(3)
			expect(updated?.lines[0].content[0]).toHaveProperty('asText', '_')
			expect(updated?.lines[0].content[1]).toHaveProperty('asText', 'some emphazised text*')
			expect(updated?.lines[0].content[2]).toHaveProperty('asText', '_')
		})
		it('updates simple emphasis, adding inner emphazised element', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some emphazised text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '**emphazised**', rangeOffset: '_some '.length, rangeLength: 'emphazised'.length, })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(3)
			expect(updated?.content[0]).toHaveProperty('type', 'text')
			expect(updated?.content[0]).toHaveProperty('text', 'some ')
			expect(updated?.content[1]).toHaveProperty('type', 'strong')
			expect((updated?.content[1] as TextSpan<any>).content[0]).toHaveProperty('text', 'emphazised')
			expect(updated?.content[2]).toHaveProperty('type', 'text')
			expect(updated?.content[2]).toHaveProperty('text', ' text')

			expect(updated?.lines[0].content).toHaveLength(5)
			expect(updated?.lines[0].content[0]).toHaveProperty('asText', '_')
			expect(updated?.lines[0].content[1]).toHaveProperty('asText', 'some ')
			expect(updated?.lines[0].content[2]).toHaveProperty('asText', '**emphazised**')
			expect(updated?.lines[0].content[3]).toHaveProperty('asText', ' text')
			expect(updated?.lines[0].content[4]).toHaveProperty('asText', '_')

			const innerLineContent = updated?.lines[0].content[2] as ParsedLine<unknown, unknown>
			expect(innerLineContent.content).toHaveLength(3)
			expect(innerLineContent.content[0]).toHaveProperty('asText', '**')
			expect(innerLineContent.content[1]).toHaveProperty('asText', 'emphazised')
			expect(innerLineContent.content[2]).toHaveProperty('asText', '**')
		})
		it('updates inner emphasis of two emphazised elements', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some **emphazised** text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: 'strongly ', rangeOffset: '_some **'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(3)
			expect(updated?.content[0]).toHaveProperty('type', 'text')
			expect(updated?.content[0]).toHaveProperty('text', 'some ')
			expect(updated?.content[1]).toHaveProperty('type', 'strong')
			expect((updated?.content[1] as TextSpan<any>).content[0]).toHaveProperty('text', 'strongly emphazised')
			expect(updated?.content[2]).toHaveProperty('type', 'text')
			expect(updated?.content[2]).toHaveProperty('text', ' text')

			expect(updated?.lines[0].content).toHaveLength(5)
			expect(updated?.lines[0].content[0]).toHaveProperty('asText', '_')
			expect(updated?.lines[0].content[1]).toHaveProperty('asText', 'some ')
			expect(updated?.lines[0].content[2]).toHaveProperty('asText', '**strongly emphazised**')
			expect(updated?.lines[0].content[3]).toHaveProperty('asText', ' text')
			expect(updated?.lines[0].content[4]).toHaveProperty('asText', '_')

			const innerLineContent = updated?.lines[0].content[2] as ParsedLine<unknown, unknown>
			expect(innerLineContent.content).toHaveLength(3)
			expect(innerLineContent.content[0]).toHaveProperty('asText', '**')
			expect(innerLineContent.content[1]).toHaveProperty('asText', 'strongly emphazised')
			expect(innerLineContent.content[2]).toHaveProperty('asText', '**')
		})
		it('updates outer emphasis of two emphazised elements when inner is not emphazised anymore', () => {
			const parser = createEmphasisParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())
			const text = '_some **emphazised** text_'

			const original = parser.parseLine(null, text, 0, text.length) as MfMEmphasis
			const updated = updateParser.parse(original, { text: '', rangeOffset: '_some '.length, rangeLength: '**'.length, })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(1)
			expect(updated?.content[0]).toHaveProperty('type', 'text')
			expect(updated?.content[0]).toHaveProperty('text', 'some emphazised** text')

			expect(updated?.lines[0].content).toHaveLength(3)
			expect(updated?.lines[0].content[0]).toHaveProperty('asText', '_')
			expect(updated?.lines[0].content[1]).toHaveProperty('asText', 'some emphazised** text')
			expect(updated?.lines[0].content[2]).toHaveProperty('asText', '_')
		})
	})
})
