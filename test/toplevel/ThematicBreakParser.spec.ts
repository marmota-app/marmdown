/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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

import { ThematicBreakParser } from "$markdown/toplevel/ThematicBreakParser"

describe('ThematicBreakParser (---, ...)', () => {
	const parser = new ThematicBreakParser()

	it('parses --- as thematic break', () => {
		const md = '---'

		const result = parser.parse(md, 0, md.length)

		expect(result).toHaveProperty('startIndex', 0)
		expect(result).toHaveProperty('length', md.length)
		expect(result?.content).toHaveProperty('type', 'HorizontalRule')
	})


	it('does not parse --- as thematic break', () => {
		const md = '--'

		const result = parser.parse(md, 0, md.length)

		expect(result).toBeNull()
	})

	const thematicBreakTestData: [string, number, string | null][] = [
		['---', 0, '---'],
		['---\n', 0, '---'],
		[' ---', 0, ' ---'],
		['  ---', 0, '  ---'],
		['   ---', 0, '   ---'],
		['    ---', 0, null],
		['----', 0, '----'],
		['-----', 0, '-----'],
		['before\n---\nafter', 'before\n'.length, '---'],
		['***', 0, '***'],
		['___', 0, '___'],
		['-  -  -  -', 0, '-  -  -  -'],
		['**\t* *\t***', 0, '**\t* *\t***'],
	]
	thematicBreakTestData.forEach(([text, start, expected]) => it(`parses ${text} as ${expected}`, () => {
		const result = parser.parse(text, start, text.length-start)

		if(expected == null) {
			expect(result).toBeNull()
		} else {
			expect(result).toHaveProperty('startIndex', start)
			expect(result).toHaveProperty('length', expected.length)
			expect(result?.content).toHaveProperty('type', 'HorizontalRule')
			expect(result?.content).toHaveProperty('asText', expected)
		}
	}))
})
