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
import { MfMFirstOptionParser, MfMOption, MfMOptionParser } from "$mfm/options/MfMOption"
import { Parsers } from "$parser/Parsers"

describe('MfMOption', () => {
	describe('parsing the content - with default', () => {
		function createOptionParser() {
			const idGenerator = new NumberedIdGenerator()
			const optionParser = new MfMFirstOptionParser({ idGenerator })
			return optionParser
		}
		it('parses a single word as default option', () => {
			const optionParser = createOptionParser()

			const text = 'the_value'
			const option = optionParser.parseLine(null, text, 0, text.length)

			expect(option).not.toBeNull()
			expect(option).toHaveProperty('key', 'default')
			expect(option).toHaveProperty('value', 'the_value')
		})

		it('parses multiple words as default option', () => {
			const optionParser = createOptionParser()

			const text = 'the value'
			const option = optionParser.parseLine(null, text, 0, text.length)

			expect(option).not.toBeNull()
			expect(option).toHaveProperty('key', 'default')
			expect(option).toHaveProperty('value', 'the value')
		});

		it('parses the default option until the ending semicolon', () => {
			const optionParser = createOptionParser()

			const text = '-ignore me- the value  ;more text'
			const option = optionParser.parseLine(null, text, '-ignore me-'.length, ' the value  ;more text'.length)

			expect(option).not.toBeNull()
			expect(option).toHaveProperty('key', 'default')
			expect(option).toHaveProperty('value', 'the value')

			expect(option?.lines[0].start).toEqual('-ignore me-'.length)
			expect(option?.lines[0].length).toEqual(' the value  ;'.length)
		})

		it('parses named option', () => {
			const optionParser = createOptionParser()

			const text = '-ignore me- the_key\t =  \t\tthe value  '
			const option = optionParser.parseLine(null, text, '-ignore me-'.length, ' the_key\t =  \t\tthe value  '.length)

			expect(option).not.toBeNull()
			expect(option).toHaveProperty('key', 'the_key')
			expect(option).toHaveProperty('value', 'the value')

			expect(option?.lines[0].start).toEqual('-ignore me-'.length)
			expect(option?.lines[0].length).toEqual(' the_key\t =  \t\tthe value  '.length)
		})
	})

	describe('parsing the content - with default', () => {
		function createOptionParser() {
			const idGenerator = new NumberedIdGenerator()
			const optionParser = new MfMOptionParser({ idGenerator })
			return optionParser
		}
		it('cannot parse a default option', () => {
			const optionParser = createOptionParser()

			const text = 'the_value'
			const option = optionParser.parseLine(null, text, 0, text.length)

			expect(option).toBeNull()
		})
	})

	describe('parsing updates', () => {
		const parsers: Parsers<never> = { idGenerator: new NumberedIdGenerator(), }
		const optionParser = new MfMFirstOptionParser(parsers)
		const updateParser = new UpdateParser()

		it('parses update to a default option', () => {
			const option = optionParser.parseLine(null, '--ignore me--the value', '--ignore me--'.length, 'the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: 'updated ', rangeOffset: '--ignore me--the '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'default')
			expect(updated).toHaveProperty('value', 'the updated value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the updated value'.length)
		})
		it('parses update to an option\'s key', () => {
			const option = optionParser.parseLine(null, '--ignore me--the_key=the value', '--ignore me--'.length, 'the_key=the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: 'updated_', rangeOffset: '--ignore me--the_'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_updated_key')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the_updated_key=the value'.length)
		})
		it('parses update to an option\'s value', () => {
			const option = optionParser.parseLine(null, '--ignore me--the_key=the value', '--ignore me--'.length, 'the_key=the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: 'updated ', rangeOffset: '--ignore me--the_key=the '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'the updated value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the_key=the updated value'.length)
		})

		it('parses update to a default option in the trimmed whitespace, changing the value (before)', () => {
			const option = optionParser.parseLine(null, '--ignore me--  \t the value\t  \t', '--ignore me--'.length, '  \t the value\t  \t'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '  updated', rangeOffset: '--ignore me--  \t'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'default')
			expect(updated).toHaveProperty('value', 'updated the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '  \t  updated the value\t  \t'.length)
		})
		it('parses update to a default option in the trimmed whitespace, changing the value (after)', () => {
			const option = optionParser.parseLine(null, '--ignore me--  \t the value\t  \t', '--ignore me--'.length, '  \t the value\t  \t'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '- updated  ', rangeOffset: '--ignore me--  \t the value\t'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'default')
			expect(updated).toHaveProperty('value', 'the value\t- updated')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '  \t the value\t- updated    \t'.length)
		})
		it('parses update to a default option in the trimmed whitespace, not changing the value (before)', () => {
			const option = optionParser.parseLine(null, '--ignore me--  \t the value\t  \t', '--ignore me--'.length, '  \t the value\t  \t'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '   ', rangeOffset: '--ignore me--  \t'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'default')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '  \t    the value\t  \t'.length)
		})
		it('parses update to a default option in the trimmed whitespace, not changing the value (after)', () => {
			const option = optionParser.parseLine(null, '--ignore me--  \t the value\t  \t', '--ignore me--'.length, '  \t the value\t  \t'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '   ', rangeOffset: '--ignore me--  \t the value\t'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'default')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '  \t the value\t     \t'.length)
		})

		it('parses update to an option\'s key in the trimmed whitespace changing, changing the key (before)', () => {
			const option = optionParser.parseLine(null, '--ignore me--   the_key   =the value', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '  updated_', rangeOffset: '--ignore me--   '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'updated_the_key')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '     updated_the_key   =the value'.length)
		})
		it('parses update to an option\'s key in the trimmed whitespace changing, changing the key (after)', () => {
			const option = optionParser.parseLine(null, '--ignore me--   the_key   =the value', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '_updated  ', rangeOffset: '--ignore me--   the_key'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key_updated')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '   the_key_updated     =the value'.length)
		})
		it('parses update to an option\'s key in the trimmed whitespace changing, not changing the key (before)', () => {
			const option = optionParser.parseLine(null, '--ignore me--   the_key   =the value', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '  \t', rangeOffset: '--ignore me--   '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '     \tthe_key   =the value'.length)
		})
		it('parses update to an option\'s key in the trimmed whitespace changing, not changing the key (after)', () => {
			const option = optionParser.parseLine(null, '--ignore me--   the_key   =the value', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '\t  ', rangeOffset: '--ignore me--   the_key'.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', '   the_key\t     =the value'.length)
		})

		it('parses update to an option\'s value in the trimmed whitespace, changing the value (before)', () => {
			const option = optionParser.parseLine(null, '--ignore me--the_key=   the value   ', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '  updated', rangeOffset: '--ignore me--the_key=  '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'updated the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the_key=    updated the value   '.length)
		})
		it('parses update to an option\'s value in the trimmed whitespace, changing the value (after)', () => {
			const option = optionParser.parseLine(null, '--ignore me--the_key=   the value   ', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '- updated\t', rangeOffset: '--ignore me--the_key=   the value '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'the value - updated')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the_key=   the value - updated\t  '.length)
		})
		it('parses update to an option\'s value in the trimmed whitespace, not changing the value (before)', () => {
			const option = optionParser.parseLine(null, '--ignore me--the_key=   the value   ', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '  \t', rangeOffset: '--ignore me--the_key=  '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the_key=    \t the value   '.length)
		})
		it('parses update to an option\'s value in the trimmed whitespace, not changing the value (after)', () => {
			const option = optionParser.parseLine(null, '--ignore me--the_key=   the value   ', '--ignore me--'.length, '   the_key   =the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '  \t', rangeOffset: '--ignore me--the_key=   the value '.length, rangeLength: 0, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the_key')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the_key=   the value   \t  '.length)
		})

		it('parses update that changes a default option to an option', () => {
			const option = optionParser.parseLine(null, '--ignore me--the value', '--ignore me--'.length, 'the value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '\t=\t', rangeOffset: '--ignore me--the'.length, rangeLength: 1, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'the')
			expect(updated).toHaveProperty('value', 'value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the\t=\tvalue'.length)
		})
		it('parses update that changes an option to a default option', () => {
			const option = optionParser.parseLine(null, '--ignore me--the = value', '--ignore me--'.length, 'the = value'.length) as MfMOption<MfMFirstOptionParser>
			const updated = updateParser.parse(option, { text: '', rangeOffset: '--ignore me--the'.length, rangeLength: 2, })

			expect(updated).not.toBeNull()
			expect(updated).toHaveProperty('key', 'default')
			expect(updated).toHaveProperty('value', 'the value')
			expect(updated?.lines[0]).toHaveProperty('start', '--ignore me--'.length)
			expect(updated?.lines[0]).toHaveProperty('length', 'the value'.length)
		})
	})
})