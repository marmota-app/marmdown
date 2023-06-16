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

import { Element, ParsedLine } from "$element/Element";
import { NumberedIdGenerator } from "$markdown/IdGenerator";
import { MfMEmphasisParser } from "$mfm/inline/MfMEmphasis"
import { MfMTextParser } from "$mfm/inline/MfMText";

describe('MfMEmphasis', () => {
	function createEmphasisParser() {
		const idGenerator = new NumberedIdGenerator()
		const MfMText = new MfMTextParser({ idGenerator })
		return new MfMEmphasisParser({
			MfMText,
			allInlines: [ MfMText, ],
			idGenerator
		});
	}

	describe('parsing the content', () => {
		describe('finding left-flanking delimiter runs', () => {
			['_', '__', '___', '____', '*', '*****', '~', '~~', '~~~~~'].forEach(delimiters => {
				it(`finds ${delimiters} as part of a left delimiter run at the start of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before ${delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

					expect(result).toHaveProperty('start', 'text before '.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`finds ${delimiters} as part of a left delimiter run in the middle of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before ${delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before '.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a left delimiter run at the end of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before ${delimiters}`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`does not find ${delimiters} as part of a left delimiter run before whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before ${delimiters} abc`

					const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a left delimiter run preceided by text`, () => {
					const parser = createEmphasisParser()
					const text = `text before${delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a left delimiter run before punctuation`, () => {
					const parser = createEmphasisParser()
					const text = `text before${delimiters}.abc`

					const result = parser.findLeftDelimiterRun(text, 'text before'.length, text.length-'text before '.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a left delimiter run before punctuation preceided by whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before\t${delimiters}.abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before\t'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
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
				const text = `text before **\\***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before '.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
		})

		describe('finding right-flanking delimiter runs', () => {
			['_', '__', '___', '____', '*', '*****', '~', '~~', '~~~~~'].forEach(delimiters => {
				it(`does not find ${delimiters} as part of a right delimiter run at the start of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before${delimiters} text after`

					const result = parser.findRightDelimiterRun(text, 'text before'.length, text.length-'text before '.length)

					expect(result).toBeNull
				})
				it(`finds ${delimiters} as part of a right delimiter run in the middle of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before${delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`finds ${delimiters} as part of a right delimiter run at the end of the content`, () => {
					const parser = createEmphasisParser()
					const text = `text before${delimiters}`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a right delimiter run after whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before ${delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a right delimiter run followed by text`, () => {
					const parser = createEmphasisParser()
					const text = `text before${delimiters}abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a right delimiter run after punctuation`, () => {
					const parser = createEmphasisParser()
					const text = `text before.${delimiters}abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a right delimiter run after punctuation followed by whitespace`, () => {
					const parser = createEmphasisParser()
					const text = `text before.${delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before.'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
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
				const text = `text before abc\\***`

				const result = parser.findRightDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toBeNull()
			})
		})

		describe('find next start', () => {
			it('finds next start at the beginning of the line', () => {
				const parser = createEmphasisParser()
				const text = '___some text__ with emphasis_ and more text'
				const result = parser.findNext(text, 0, text.length)
				expect(result).toEqual(0)
			})
			it('does not find next start when there is no more left-flanking delimiter run', () => {
				const parser = createEmphasisParser()
				const text = '___some text__ with emphasis_ and more text'
				const result = parser.findNext(text, 3, text.length-3)
				expect(result).toEqual(null)
			})
			it('finds next in the middle of the text when there is a left-flanking delimiter run', () => {
				const parser = createEmphasisParser()
				const text = 'text before; some ___text__ with emphasis_ and more text'
				const result = parser.findNext(text, 'text before; '.length, text.length - 'text before; '.length)
				expect(result).toEqual('text before; some '.length)
			})
			it('does not find next outside of the search area (before)', () => {
				const parser = createEmphasisParser()
				const text = 'text before; some ___text__ with emphasis_ and more text'
				const result = parser.findNext(text, 'text before; some ___text'.length, text.length - 'text before; some ___text'.length)
				expect(result).toEqual(null)
			})
			it('does not find next outside of the search area (after)', () => {
				const parser = createEmphasisParser()
				const text = 'text before; some ___text__ with emphasis_ and more text'
				const result = parser.findNext(text, 0, 'text before;'.length)
				expect(result).toEqual(null)
			})
		});

		[['_', '*'], ['*', '_']].forEach(([token, otherToken]) => {
			describe('parse emphasis', () => {
				it('parses simple emphasis', () => {
					const parser = createEmphasisParser()
					const text = `${token}emphazised${token}`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'emphasis')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')
				})
				it('does not parse emphasis when the text does not contain a left-flanking delimiter run', () => {
					const parser = createEmphasisParser()
					const text = `not emphazised${token} also not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).toBeNull()
				})
				it('parses emphasis until the closing delimiter', () => {
					const parser = createEmphasisParser()
					const text = `${token}emphazised${token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'emphasis')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `${token}emphazised${token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
					expect(result?.lines[0].content[2]).toHaveProperty('asText', token)
				})
				it('parses emphasis until the closing delimiter, with other delimiters in-between', () => {
					//TODO: Test, where there is a left-flanking delimiter run
					//      e.g. '_some *emphazised_ with more text...'
					//      But what should happen in that case???
					const parser = createEmphasisParser()
					const text = `${token}some${otherToken} emphazised${token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'emphasis')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `some${otherToken} emphazised`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `${token}some${otherToken} emphazised${token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some${otherToken} emphazised`)
					expect(result?.lines[0].content[2]).toHaveProperty('asText', token)
				})
			})
			describe('parse strong emphasis', () => {
				it('parses simple strong emphasis', () => {
					const parser = createEmphasisParser()
					const text = `${token}${token}emphazised${token}${token}`
					const result = parser.parseLine(null, text, 0, text.length)

					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')

					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')

					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `${token}${token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `${token}${token}`)
				})
				it('does not parse strong emphasis when the text does not contain a left-flanking delimiter run', () => {
					const parser = createEmphasisParser()
					const text = `not emphazised${token}${token} also not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).toBeNull()
				})
				it('parses strong emphasis until the closing delimiter', () => {
					const parser = createEmphasisParser()
					const text = `${token}${token}emphazised${token}${token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `${token}${token}emphazised${token}${token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `${token}${token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'emphazised')
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `${token}${token}`)
				})
				it('parses strong emphasis until the closing delimiter, with other delimiters in-between', () => {
					//TODO: Test, where there is a left-flanking delimiter run
					//      e.g. '__some **emphazised__ with more text...'
					//      But what should happen in that case???
					const parser = createEmphasisParser()
					const text = `${token}${token}some${otherToken}${otherToken} emphazised${token}${token} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', 'strong')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `some${otherToken}${otherToken} emphazised`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', `${token}${token}some${otherToken}${otherToken} emphazised${token}${token}`)
					expect(result?.lines[0].content).toHaveLength(3)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `${token}${token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some${otherToken}${otherToken} emphazised`)
					expect(result?.lines[0].content[2]).toHaveProperty('asText', `${token}${token}`)
				})
			})
			describe('parse text-span', () => {
				it('parses a text-span when the text does not contain a right-flanking delimiter run', () => {
					const parser = createEmphasisParser()
					const text = `${token}not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'not emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'not emphazised')
				})
				it('parses a text-span when there is no matching closing delimiter', () => {
					const parser = createEmphasisParser()
					const text = `${token}some not emphazised${otherToken} with more text...`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `some not emphazised${otherToken} with more text...`)
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', token)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `some not emphazised${otherToken} with more text...`)
				})
				it('parses a text-span when the text does not contain a right-flanking delimiter run for strong emphasis', () => {
					const parser = createEmphasisParser()
					const text = `${token}${token}not emphazised`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', 'not emphazised')
	
					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `${token}${token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', 'not emphazised')
				})
				it('parses text-span when the number of closing delimiters for strong emphasis is less than 2', () => {
					const parser = createEmphasisParser()
					const text = `${token}${token}not emphazised${token}`
					const result = parser.parseLine(null, text, 0, text.length)
	
					expect(result).not.toBeNull()
					expect(result).toHaveProperty('type', '--text-span--')
	
					expect(result?.content).toHaveLength(1)
					expect(result?.content[0]).toHaveProperty('type', 'text')
					expect(result?.content[0]).toHaveProperty('text', `not emphazised${token}`)

					expect(result?.lines).toHaveLength(1)
					expect(result?.lines[0]).toHaveProperty('asText', text)
					expect(result?.lines[0].content).toHaveLength(2)
					expect(result?.lines[0].content[0]).toHaveProperty('asText', `${token}${token}`)
					expect(result?.lines[0].content[1]).toHaveProperty('asText', `not emphazised${token}`)
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
				//TODO: Test, where there is a left-flanking delimiter run
				//      e.g. '~some **emphazised~ with more text...'
				//      But what should happen in that case???
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
			it.skip('creates <em><strong> on "___"', () => {
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
			it.skip('creates <strong><strong> on "____"', () => {})
			it.skip('creates <em><strong><strong> on "_____"', () => {})
			it.skip('creates <strong><em> on "**_"', () => {})
			it.skip('creates <del><del> on "~~~"', () => {})
			it.skip('creates <del><del> on "~~~~"', () => {})
			it.skip('creates <del><em> on "~~_"', () => {})
			it.skip('creates <del><strong> on "~~__"', () => {})
			it.skip('creates <del><em><strong> on "~~___"', () => {})
			it.skip('creates <em><del><strong> on "_~**"', () => {})
			it.skip('creates strong with embedded em', () => {})
			it.skip('creates strong with embedded em with embedded del', () => {})
			it.skip('creates em with embedded del and embedded em next to each other', () => {})
		})
	})
	describe.skip('parsing options', () => {
	})
	describe.skip('parsing updates', () => {
	})
})
