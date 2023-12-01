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

import { MfMList } from "../../../src/mfm/block/MfMList";
import { createListItemParser } from "./createListParser";

describe('MfMList', () => {
	describe('parsing the content', () => {
		[ '*', '+', '1.'].forEach(marker => it(`parses list with mutliple items (same marker: ${marker})`, () => {
			const { parser } = createListItemParser()

			const line1 = `${marker} line 1`
			const line2 = `${marker} line 2`

			const intermediate = parser.parseLine(null, line1, 0, line1.length) as MfMList
			const result = intermediate.parsedWith.parseLine(intermediate, line2, 0, line2.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list')
			expect(result).toEqual(intermediate)
		}));
		[ ['*', '-'], ['+', '1.'], ['1.', '1)']].forEach(([marker1, marker2]) => it(`does not parse list with mutliple items (different marker: ${marker1} -> ${marker2})`, () => {
			const { parser } = createListItemParser()

			const line1 = `${marker1} line 1`
			const line2 = `${marker2} line 2`

			const intermediate = parser.parseLine(null, line1, 0, line1.length) as MfMList
			const result = intermediate.parsedWith.parseLine(intermediate, line2, 0, line2.length)

			expect(result).toBeNull()
		}));
		it('can continue the previous list item', () => {
			const { parser } = createListItemParser()

			const line1 = `* line 1`
			const line2 = `  line 2`

			const intermediate = parser.parseLine(null, line1, 0, line1.length) as MfMList
			const result = intermediate.parsedWith.parseLine(intermediate, line2, 0, line2.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			
			expect(result?.content[0].lines).toHaveLength(2)
			expect(result?.content[0].lines[0]).toHaveProperty('asText', line1)
			expect(result?.content[0].lines[1]).toHaveProperty('asText', line2)
		})
	})
})
