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

import { findTrimmed } from "$parser/find"

describe('find', () => {
	describe('findTrimmed', () => {
		it('finds the whole text when the delimiter is not part of the string', () => {
			const text = '-ignore me-the text-ignore me-'
			const result = findTrimmed(text, [ ';', ], '-ignore me-'.length, 'the text'.length)
			
			expect(result).toHaveProperty('found', 'the text')
			expect(result).toHaveProperty('foundStart', '-ignore me-'.length)
			expect(result).toHaveProperty('foundLength', 'the text'.length)

			expect(result.trimBefore).toBeUndefined()
			expect(result.trimAfter).toBeUndefined()
			expect(result.delimiter).toBeUndefined()
		})

		it('finds the text until the delimiter when delimiter is part of the string', () => {
			const text = '-ignore me-the text;-ignore me-'
			const result = findTrimmed(text, [ ';', ], '-ignore me-'.length, 'the text;'.length)
			
			expect(result).toHaveProperty('found', 'the text')
			expect(result).toHaveProperty('foundStart', '-ignore me-'.length)
			expect(result).toHaveProperty('foundLength', 'the text'.length)

			expect(result).toHaveProperty('delimiter', ';')
			expect(result).toHaveProperty('delimiterStart', '-ignore me-the text'.length)
			expect(result).toHaveProperty('delimiterLength', ';'.length)

			expect(result.trimBefore).toBeUndefined()
			expect(result.trimAfter).toBeUndefined()
		})

		it('finds a completely trimmed text until the delimiter', () => {
			const text = '-ignore me- \t the text\t \t \t;-ignore me-'
			const result = findTrimmed(text, [ ';', ], '-ignore me-'.length, ' \t the text\t \t \t;-ignore me-'.length)
			
			expect(result).toHaveProperty('trimBefore', ' \t ')
			expect(result).toHaveProperty('trimBeforeStart', '-ignore me-'.length)
			expect(result).toHaveProperty('trimBeforeLength', ' \t '.length)

			expect(result).toHaveProperty('trimAfter', '\t \t \t')
			expect(result).toHaveProperty('trimAfterStart', '-ignore me- \t the text'.length)
			expect(result).toHaveProperty('trimAfterLength', '\t \t \t'.length)

			expect(result).toHaveProperty('found', 'the text')
			expect(result).toHaveProperty('foundStart', '-ignore me- \t '.length)
			expect(result).toHaveProperty('foundLength', 'the text'.length)

			expect(result).toHaveProperty('delimiter', ';')
			expect(result).toHaveProperty('delimiterStart', '-ignore me- \t the text\t \t \t'.length)
			expect(result).toHaveProperty('delimiterLength', ';'.length)
		})

		it('finds a completely trimmed text until the end when there is no delimiter', () => {
			const text = '-ignore me- \t the text;-don\'t ignore me-\t \t \t'
			const result = findTrimmed(text, [], '-ignore me-'.length, ' \t the text;-don\'t ignore me-\t \t \t'.length)
			
			expect(result).toHaveProperty('trimBefore', ' \t ')
			expect(result).toHaveProperty('trimBeforeStart', '-ignore me-'.length)
			expect(result).toHaveProperty('trimBeforeLength', ' \t '.length)

			expect(result).toHaveProperty('trimAfter', '\t \t \t')
			expect(result).toHaveProperty('trimAfterStart', '-ignore me- \t the text;-don\'t ignore me-'.length)
			expect(result).toHaveProperty('trimAfterLength', '\t \t \t'.length)

			expect(result).toHaveProperty('found', 'the text;-don\'t ignore me-')
			expect(result).toHaveProperty('foundStart', '-ignore me- \t '.length)
			expect(result).toHaveProperty('foundLength', 'the text;-don\'t ignore me-'.length)
		})

		it('finds a completely trimmted text at the start of the string', () => {
			const text = ' \t the text;-don\'t ignore me-\t \t \t'
			const result = findTrimmed(text, [], 0, ' \t the text;-don\'t ignore me-\t \t \t'.length)
			
			expect(result).toHaveProperty('trimBefore', ' \t ')
			expect(result).toHaveProperty('trimBeforeStart', 0)
			expect(result).toHaveProperty('trimBeforeLength', ' \t '.length)

			expect(result).toHaveProperty('trimAfter', '\t \t \t')
			expect(result).toHaveProperty('trimAfterStart', ' \t the text;-don\'t ignore me-'.length)
			expect(result).toHaveProperty('trimAfterLength', '\t \t \t'.length)

			expect(result).toHaveProperty('found', 'the text;-don\'t ignore me-')
			expect(result).toHaveProperty('foundStart', ' \t '.length)
			expect(result).toHaveProperty('foundLength', 'the text;-don\'t ignore me-'.length)
		})
	})
})
