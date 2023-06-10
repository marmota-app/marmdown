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

import { NumberedIdGenerator } from "$markdown/IdGenerator";
import { MfMEmphasisParser } from "$mfm/inline/MfMEmphasis"

describe('MfMEmphasis', () => {
	describe('parsing the content', () => {
		describe('finding left-flanking delimiter runs', () => {
			const parser = new MfMEmphasisParser({ idGenerator: new NumberedIdGenerator });

			['_', '__', '___', '____', '*', '*****', '~', '~~', '~~~~~'].forEach(delimiters => {
				it(`finds ${delimiters} as part of a left delimiter run at the start of the content`, () => {
					const text = `text before ${delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

					expect(result).toHaveProperty('start', 'text before '.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`finds ${delimiters} as part of a left delimiter run in the middle of the content`, () => {
					const text = `text before ${delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before '.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a left delimiter run at the end of the content`, () => {
					const text = `text before ${delimiters}`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`does not find ${delimiters} as part of a left delimiter run before whitespace`, () => {
					const text = `text before ${delimiters} abc`

					const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a left delimiter run preceided by text`, () => {
					const text = `text before${delimiters}abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a left delimiter run before punctuation`, () => {
					const text = `text before${delimiters}.abc`

					const result = parser.findLeftDelimiterRun(text, 'text before'.length, text.length-'text before '.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a left delimiter run before punctuation preceided by whitespace`, () => {
					const text = `text before\t${delimiters}.abc`

					const result = parser.findLeftDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before\t'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
			})
			it(`finds shorter run with \\*** as part of a left delimiter run at the start of the line`, () => {
				const text = `text before \\***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before \\*'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
			it(`finds shorter run with \\*\\** as part of a left delimiter run at the start of the line`, () => {
				const text = `text before \\*\\**abc`

				const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before \\*\\*'.length)
				expect(result).toHaveProperty('length', 1)
				expect(result).toHaveProperty('character', '*')
			})
			it(`finds shorter run with **\\*** as part of a left delimiter run at the start of the line`, () => {
				const text = `text before **\\***abc`

				const result = parser.findLeftDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before '.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
		})

		describe('finding right-flanking delimiter runs', () => {
			const parser = new MfMEmphasisParser({ idGenerator: new NumberedIdGenerator });

			['_', '__', '___', '____', '*', '*****', '~', '~~', '~~~~~'].forEach(delimiters => {
				it(`does not find ${delimiters} as part of a right delimiter run at the start of the content`, () => {
					const text = `text before${delimiters} text after`

					const result = parser.findRightDelimiterRun(text, 'text before'.length, text.length-'text before '.length)

					expect(result).toBeNull
				})
				it(`finds ${delimiters} as part of a right delimiter run in the middle of the content`, () => {
					const text = `text before${delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`finds ${delimiters} as part of a right delimiter run at the end of the content`, () => {
					const text = `text before${delimiters}`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a right delimiter run after whitespace`, () => {
					const text = `text before ${delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a right delimiter run followed by text`, () => {
					const text = `text before${delimiters}abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
				it(`does not find ${delimiters} as part of a right delimiter run after punctuation`, () => {
					const text = `text before.${delimiters}abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toBeNull()
				})
				it(`finds ${delimiters} as part of a right delimiter run after punctuation followed by whitespace`, () => {
					const text = `text before.${delimiters} abc`

					const result = parser.findRightDelimiterRun(text, 0, text.length)

					expect(result).toHaveProperty('start', 'text before.'.length)
					expect(result).toHaveProperty('length', delimiters.length)
					expect(result).toHaveProperty('character', delimiters.charAt(0))
				})
			})
			it(`finds right delimiter run with **\\* as part of a left delimiter run at the end of the line`, () => {
				const text = `text before abc**\\*`

				const result = parser.findRightDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toHaveProperty('start', 'text before abc'.length)
				expect(result).toHaveProperty('length', 2)
				expect(result).toHaveProperty('character', '*')
			})
			it(`does not find right delimiter run with \\***`, () => {
				const text = `text before abc\\***`

				const result = parser.findRightDelimiterRun(text, 'text before '.length, text.length-'text before '.length)

				expect(result).toBeNull()
			})
		})
	})
	describe.skip('parsing options', () => {
	})
	describe.skip('parsing updates', () => {
	})
})
