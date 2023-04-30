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
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
import { Parsers } from "$parser/Parsers"

describe('MfMText', () => {
	describe('parsing the content', () => {
		it('parses simple text as string content', () => {
			const parsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), }
			const textParser = new MfMTextParser(parsers)

			const text = textParser.parseLine(null, 'the text', 0, 'the text'.length)

			expect(text).toHaveProperty('text', 'the text')
		})

		it('returns null when previous is set', () => {
			const parsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), }
			const textParser = new MfMTextParser(parsers)

			const prev = textParser.parseLine(null, 'the text', 0, 'the text'.length)
			const text = textParser.parseLine(prev, 'the text', 0, 'the text'.length)

			expect(text).toBeNull()
		})
	})

	describe('parsing updates', () => {
		const parsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), }
		const textParser = new MfMTextParser(parsers)
		const originalText = textParser.parseLine(null, '---ignore---the original text---ignore---', '---ignore---'.length, 'the original text'.length) as MfMText
		const updateParser = new UpdateParser(new NumberedIdGenerator())

		it('parses update to text content when update is in range', () => {
			const updated = updateParser.parse(originalText, { text: 'simple ', rangeOffset: '---ignore---'.length+'the '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('text', 'the simple original text')
			expect(updated?.lines[0]).toHaveProperty('start', '---ignore---'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the simple original text'.length)
		})
	})
})