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
import { MfMListTask, MfMListTaskParser } from "../../../src/mfm/inline/MfMListTask"
import { MfMOptionsParser } from "../../../src/mfm/options/MfMOptions"
import { Parsers } from "../../../src/parser/Parsers"
import { createOptionsParser } from "../options/createOptionsParser"

describe('MfMListTask', () => {
	function createListTaskParser() {
		const idGenerator = new NumberedIdGenerator()
		const MfMOptions = createOptionsParser(idGenerator)
		const parsers: Parsers<MfMOptionsParser> = { idGenerator, MfMOptions }
		return { parser: new MfMListTaskParser(parsers), idGenerator }
	}

	describe('parsing the content', () => {
		it('parses unchecked list task', () => {
			const { parser } = createListTaskParser()

			const result = parser.parseLine(null, '[ ]', 0, 3)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list-task')
			expect(result).toHaveProperty('done', false)
		})

		it('parses line content of unchecked list task', () => {
			const { parser } = createListTaskParser()

			const result = parser.parseLine(null, '[ ]', 0, 3)

			expect(result).not.toBeNull()
			expect(result?.lines[0]).toHaveProperty('asText', '[ ]')
		})

		it('parses unchecked, empty list task', () => {
			const { parser } = createListTaskParser()

			const result = parser.parseLine(null, '[]', 0, 3)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list-task')
			expect(result).toHaveProperty('done', false)
			expect(result?.lines[0]).toHaveProperty('asText', '[]')
		})

		it('parses checked list task', () => {
			const { parser } = createListTaskParser()

			const before = 'ignore me\n'
			const item = '[x]'
			const text = `${before}${item}`

			const result = parser.parseLine(null, text, before.length, item.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'list-task')
			expect(result).toHaveProperty('done', true)
		});

		[ '[', '[  ]', '[y]', '[xx]'].forEach(illegal => it(`does not parse "${illegal}"`, () => {
			const { parser } = createListTaskParser()

			const result = parser.parseLine(null, illegal, 0, illegal.length)

			expect(result).toBeNull()
		}))
	})
	describe('parsing options', () => {
		it('parses options after list task', () => {
			const { parser } = createListTaskParser()

			const before = 'ignore me\n'
			const item = '[x]{ do; k1=v1 }'
			const text = `${before}${item}`
			const result = parser.parseLine(null, text, before.length, item.length)

			expect(result).not.toBeNull()
			expect(result?.options.get('default')).toEqual('do')
			expect(result?.options.get('k1')).toEqual('v1')
			expect(result?.lines[0]).toHaveProperty('asText', item)
		})
		it('does not add partially parsed options to list task', () => {
			const { parser } = createListTaskParser()

			const before = 'ignore me\n'
			const item = '[x]{ do; k1=v1'
			const text = `${before}${item}`
			const result = parser.parseLine(null, text, before.length, item.length)

			expect(result).not.toBeNull()
			expect(result?.options.keys).toHaveLength(0)
			expect(result?.lines[0]).toHaveProperty('asText', '[x]')
		})
	})
	describe('parsing updates', () => {
		it('parses update, setting "done" from false to true', () => {
			const { parser, idGenerator } = createListTaskParser()
			const updateParser = new UpdateParser(idGenerator)

			const original = parser.parseLine(null, '[ ]', 0, 3) as MfMListTask
			const result = updateParser.parse(original, { text: 'x', rangeOffset: 1, rangeLength: 1 })

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('done', true)
			expect(result?.lines[0]).toHaveProperty('asText', '[x]')
		})
		it('parses update, setting "done" from true to false', () => {
			const { parser, idGenerator } = createListTaskParser()
			const updateParser = new UpdateParser(idGenerator)

			const original = parser.parseLine(null, '[x]', 0, 3) as MfMListTask
			const result = updateParser.parse(original, { text: ' ', rangeOffset: 1, rangeLength: 1 })

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('done', false)
			expect(result?.lines[0]).toHaveProperty('asText', '[ ]')
		})
		it('parses update, setting "done" from true to false via two steps', () => {
			const { parser, idGenerator } = createListTaskParser()
			const updateParser = new UpdateParser(idGenerator)

			const original = parser.parseLine(null, '[x]', 0, 3) as MfMListTask
			const intermediate = updateParser.parse(original, { text: '', rangeOffset: 1, rangeLength: 1 }) as MfMListTask
			const result = updateParser.parse(intermediate, { text: ' ', rangeOffset: 1, rangeLength: 0 })

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('done', false)
			expect(result?.lines[0]).toHaveProperty('asText', '[ ]')
		})
	})
})