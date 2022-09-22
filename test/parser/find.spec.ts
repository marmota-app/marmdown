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
import { find } from "$markdown/parser/find"

describe('find', () => {
	describe('searching for strings', () => {
		it('returns null when text was not found', () => {
			const result = find('foo', 'x', 0, 3)
	
			expect(result).toBeNull()
		})
	
		it('finds string at the start of the text', () => {
			const result = find('foo', 'fo', 0, 3)
			
			expect(result).toHaveProperty('foundText', 'fo')
			expect(result).toHaveProperty('length', 2)
		})
	
		it('finds string in the middle of the text', () => {
			const result = find('something foo', 'fo', 'something '.length, 3)
			
			expect(result).toHaveProperty('foundText', 'fo')
			expect(result).toHaveProperty('length', 2)
		})
	})

	describe('searching for regex', () => {
		it('finds regex at the start of the text', () => {
			const result = find('123abc', /[0-9]+/, 0, 6)
	
			expect(result).toHaveProperty('foundText', '123')
			expect(result).toHaveProperty('length', 3)
		})

		it('finds regex in the middle of the text', () => {
			const result = find('123abc', /[a-z]+/, 3, 3)
	
			expect(result).toHaveProperty('foundText', 'abc')
			expect(result).toHaveProperty('length', 3)
		})
	})

	describe('searching and whitespace', () => {
		it('ignores leading whitespace when searching for a string', () => {
			const result = find(' \tfoo', 'fo', 0, 5)
			
			expect(result).toHaveProperty('foundText', 'fo')
			expect(result).toHaveProperty('length', 4)
		})
		it('ignores leading whitespace when searching for a regex', () => {
			const result = find(' \t123abc', /[0-9]+/, 0, 8)
			
			expect(result).toHaveProperty('foundText', '123')
			expect(result).toHaveProperty('length', 5)
		})
		it('finds regex [a-z]+ at postion 1 in realistic text "{ foo = bar}"', () => {
			const result = find('{ foo = bar}', /[a-z]+/, 1, 11)

			expect(result).toHaveProperty('foundText', 'foo')
		})
		it('returns null if there are more leading whitespaces than allowed', () => {
			const result = find(' \t \tfoo', 'fo', 0, 5, { maxLeadingSpaces: 3, })
			
			expect(result).toBeNull()
		})
	})

	it('notifies the listener of the result length', () => {
		let resultLength = -1

		find('123abc', /[0-9]+/, 0, 6, { whenFound: l => resultLength=l })

		expect(resultLength).toEqual(3)
	})
	it('does not notify the listener when there is no result', () => {
		let resultLength = -1

		find('123abc', /[xyz]+/, 0, 6, { whenFound: l => resultLength=l })

		expect(resultLength).toEqual(-1)
	})

	describe('special cases', () => {
		it('finds single "#"', () => {
			const result = find('#', '#', 0, 1)
	
			expect(result).toHaveProperty('foundText', '#')
			expect(result).toHaveProperty('length', 1)
		})
	})
})