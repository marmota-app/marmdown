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
import { MfMFirstOptionParser, MfMOptionParser } from "$mfm/options/MfMOption"
import { MfMOptions, MfMOptionsParser } from "$mfm/options/MfMOptions"
import { Parsers } from "$parser/Parsers"
import { not } from "omnimock"
import { createOptionsParser } from "./createOptionsParser"

describe('MfMOptions', () => {
	describe('parsing the content', () => {
		it('parses an empty options block', () => {
			const parser = createOptionsParser()

			const text = '{'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(0)
			expect(result?.lines[0].length).toEqual(text.length)
		})

		it('does not parse an string that does not contain an options block at the very start', () => {
			const parser = createOptionsParser()

			const text = ' {}'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).toBeNull()
		})

		it('parses an open options block with a default option', () => {
			const parser = createOptionsParser()

			const text = '{ the value  '
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('key', 'default')
			expect(result?.content[0]).toHaveProperty('value', 'the value')
			expect(result?.lines[0].length).toEqual(text.length)
		})

		it('parses a closed options block with a default option', () => {
			const parser = createOptionsParser()

			const text = '{ the value }--ignore me--'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('key', 'default')
			expect(result?.content[0]).toHaveProperty('value', 'the value')
			expect(result?.lines[0].length).toEqual('{ the value }'.length)
		})

		it('parses a closed options block with a second option', () => {
			const parser = createOptionsParser()

			const text = '{ the value; key2=value2 }--ignore me--'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)
			
			expect(result?.content[0]).toHaveProperty('key', 'default')
			expect(result?.content[0]).toHaveProperty('value', 'the value')

			expect(result?.content[1]).toHaveProperty('key', 'key2')
			expect(result?.content[1]).toHaveProperty('value', 'value2')

			expect(result?.lines[0].length).toEqual('{ the value; key2=value2 }'.length)
		})

		it('cannot parse a default option as the second option', () => {
			const parser = createOptionsParser()

			const text = '{ key1=value1; the value }--ignore me--'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			
			expect(result?.content[0]).toHaveProperty('key', 'key1')
			expect(result?.content[0]).toHaveProperty('value', 'value1')

			expect(result?.lines[0].length).toEqual('{ key1=value1;'.length)
		})

		it('parses a closed options block with three named options', () => {
			const parser = createOptionsParser()

			const text = '{ key1=value1; key2   = value2\t;  \tkey3 =      val \tue3; }--ignore me--'
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(3)
			
			expect(result?.content[0]).toHaveProperty('key', 'key1')
			expect(result?.content[0]).toHaveProperty('value', 'value1')

			expect(result?.content[1]).toHaveProperty('key', 'key2')
			expect(result?.content[1]).toHaveProperty('value', 'value2')

			expect(result?.content[2]).toHaveProperty('key', 'key3')
			expect(result?.content[2]).toHaveProperty('value', 'val \tue3')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0].length).toEqual('{ key1=value1; key2   = value2\t;  \tkey3 =      val \tue3; }'.length)
		})
	})

	describe('parsing multi-line content', () => {
		it('parses a second line when the first line was not yet closed', () => {
			const parser = createOptionsParser()

			const firstLine = '{ the value'
			const secondLine = 'key2=value2 }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)
			
			expect(result?.content[0]).toHaveProperty('key', 'default')
			expect(result?.content[0]).toHaveProperty('value', 'the value')

			expect(result?.content[1]).toHaveProperty('key', 'key2')
			expect(result?.content[1]).toHaveProperty('value', 'value2')

			expect(result?.lines).toHaveLength(2)
			expect(result?.lines[0].length).toEqual(firstLine.length)
			expect(result?.lines[1].length).toEqual(secondLine.length)
		})

		it('does not parse a second line when the first line is already closed', () => {
			const parser = createOptionsParser()

			const firstLine = '{ the value }'
			const secondLine = 'key2=value2 }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length)

			expect(result).toBeNull()
		})

		it('does not parse a second line when it starts with an opening bracket', () => {
			const parser = createOptionsParser()

			const firstLine = '{ the value'
			const secondLine = '{ key2=value2 }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length)

			expect(result).toBeNull()
		})

		it('does not parse a default option in the second line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ the value'
			const secondLine = ' another default }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length)

			expect(result).toBeNull()
			expect(first?.content).toHaveLength(1)
			
			expect(first?.content[0]).toHaveProperty('key', 'default')
			expect(first?.content[0]).toHaveProperty('value', 'the value')

			expect(first?.lines).toHaveLength(1)
			expect(first?.lines[0].length).toEqual(firstLine.length)
		})

		it.skip('does not end parsing on an escaped closing bracket in the first line', () => {})
	})

	describe('parsing updates', () => {
		const updateParser = new UpdateParser()
		it('parses an update to a default option', () => {
			const parser = createOptionsParser()

			const text = '{ default value; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: 'the ', rangeOffset: '{ '.length, rangeLength: 0 })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'the default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', text.length+'the '.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ the default value; key2=value2 }')
		})
		it('parses an update to an option', () => {
			const parser = createOptionsParser()

			const text = '{ default value; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: 'the ', rangeOffset: '{ default value; key2='.length, rangeLength: 0 })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'the value2')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', text.length+'the '.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ default value; key2=the value2 }')
		})
		it('parses adding a complete option', () => {
			const parser = createOptionsParser()

			const text = '{ default value; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: ';key3=value3', rangeOffset: '{ default value; key2=value2'.length, rangeLength: 0 })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(3)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.content[2]).toHaveProperty('key', 'key3')
			expect(updated?.content[2]).toHaveProperty('value', 'value3')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', text.length+';key3=value3'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ default value; key2=value2;key3=value3 }')
		})
		it('parses removing a complete option', () => {
			const parser = createOptionsParser()

			const text = '{ default value; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '', rangeOffset: '{ default value;'.length, rangeLength: ' key2=value2'.length })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(1)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', '{ default value; }'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ default value; }')
		})
		it('parses removing the equals sign from an option, ending the options block', () => {
			const parser = createOptionsParser()

			const text = '{ default value; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '', rangeOffset: '{ default value; key2'.length, rangeLength: '='.length })

			expect(updated).toBeNull()
		})
		it('parses removing the equals sign from the first option, making it the default option', () => {
			const parser = createOptionsParser()

			const text = '{ key1=value1; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: ' ', rangeOffset: '{ key1'.length, rangeLength: '='.length })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'key1 value1')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', '{ key1 value1; key2=value2 }'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ key1 value1; key2=value2 }')
		})
		it('parses adding an equals sign to the default, making it a named first option', () => {
			const parser = createOptionsParser()

			const text = '{ key1 value1; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '=', rangeOffset: '{ key1'.length, rangeLength: ' '.length })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'key1')
			expect(updated?.content[0]).toHaveProperty('value', 'value1')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', '{ key1=value1; key2=value2 }'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ key1=value1; key2=value2 }')
		})
		it('parses adding a closing bracket to an option block that was not closed', () => {
			const parser = createOptionsParser()

			const text = '{ key1=value1; key2=value2'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '}', rangeOffset: '{ key1 value1; key2=value2'.length, rangeLength: 0 })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'key1')
			expect(updated?.content[0]).toHaveProperty('value', 'value1')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.lines).toHaveLength(1)
			expect(updated?.lines[0]).toHaveProperty('length', '{ key1=value1; key2=value2}'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ key1=value1; key2=value2}')
		})
		it('parses adding another closing bracket in the middle of the block', () => {
			const parser = createOptionsParser()

			const text = '{ key1=value1; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '}', rangeOffset: '{ key1 value1; '.length, rangeLength: 0 })

			expect(updated).toBeNull()
		})
		it('parses removing the opening bracket', () => {
			const parser = createOptionsParser()

			const text = '{ key1=value1; key2=value2 }'
			const result = parser.parseLine(null, text, 0, text.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '', rangeOffset: 0, rangeLength: '{'.length })

			expect(updated).toBeNull()
		})
	})

	describe('parsing updates to multi-line content', () => {
		const updateParser = new UpdateParser()
		it('parses adding an option in the first line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3; }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: ';key4=value4', rangeOffset: '{ default value; key2=value2'.length, rangeLength: 0 })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(4)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.content[2]).toHaveProperty('key', 'key4')
			expect(updated?.content[2]).toHaveProperty('value', 'value4')

			expect(updated?.content[3]).toHaveProperty('key', 'key3')
			expect(updated?.content[3]).toHaveProperty('value', 'value3')

			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('length', firstLine.length+';key4=value4'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ default value; key2=value2;key4=value4')

			expect(updated?.lines[1]).toHaveProperty('length', secondLine.length)
			expect(updated?.lines[1]).toHaveProperty('asText', secondLine)
		})

		it('parses adding an option in the second line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3; }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: ' key4=value4', rangeOffset: `${firstLine}\nkey3=value3;`.length, rangeLength: 0 })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(4)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.content[2]).toHaveProperty('key', 'key3')
			expect(updated?.content[2]).toHaveProperty('value', 'value3')

			expect(updated?.content[3]).toHaveProperty('key', 'key4')
			expect(updated?.content[3]).toHaveProperty('value', 'value4')

			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('length', firstLine.length)
			expect(updated?.lines[0]).toHaveProperty('asText', firstLine)

			expect(updated?.lines[1]).toHaveProperty('length', secondLine.length+' key4=value4'.length)
			expect(updated?.lines[1]).toHaveProperty('asText', 'key3=value3; key4=value4 }')
		})
		it('parses removing an option in the first line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3; }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '', rangeOffset: `{ default value;`.length, rangeLength: ' key2=value2'.length })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key3')
			expect(updated?.content[1]).toHaveProperty('value', 'value3')

			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('length', '{ default value;'.length)
			expect(updated?.lines[0]).toHaveProperty('asText', '{ default value;')

			expect(updated?.lines[1]).toHaveProperty('length', secondLine.length)
			expect(updated?.lines[1]).toHaveProperty('asText', secondLine)
		})
		it('parses removing an option in the second line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3; }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '', rangeOffset: `${firstLine}\n`.length, rangeLength: 'key3=value3;'.length })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(2)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('length', firstLine.length)
			expect(updated?.lines[0]).toHaveProperty('asText', firstLine)

			expect(updated?.lines[1]).toHaveProperty('length', ' }'.length)
			expect(updated?.lines[1]).toHaveProperty('asText', ' }')
		})
		it('parses adding a closing bracket in the first line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3; }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '}', rangeOffset: `${firstLine}`.length, rangeLength: 0 })

			expect(updated).toBeNull()
		})
		it('parses adding an opening bracket in the second line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3; }'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: '{', rangeOffset: `${firstLine}\n`.length, rangeLength: 0 })

			expect(updated).toBeNull()
		})
		it('parses adding a closing bracket in the second line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3;'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: ' }', rangeOffset: `${firstLine}\n${secondLine}`.length, rangeLength: ''.length })

			expect(updated).not.toBeNull()
			expect(updated?.content).toHaveLength(3)

			expect(updated?.content[0]).toHaveProperty('key', 'default')
			expect(updated?.content[0]).toHaveProperty('value', 'default value')

			expect(updated?.content[1]).toHaveProperty('key', 'key2')
			expect(updated?.content[1]).toHaveProperty('value', 'value2')

			expect(updated?.content[2]).toHaveProperty('key', 'key3')
			expect(updated?.content[2]).toHaveProperty('value', 'value3')

			expect(updated?.lines).toHaveLength(2)
			expect(updated?.lines[0]).toHaveProperty('length', firstLine.length)
			expect(updated?.lines[0]).toHaveProperty('asText', firstLine)

			expect(updated?.lines[1]).toHaveProperty('length', 'key3=value3; }'.length)
			expect(updated?.lines[1]).toHaveProperty('asText', 'key3=value3; }')
		})
		it('parses removing the equals sign of an option in the second line', () => {
			const parser = createOptionsParser()

			const firstLine = '{ default value; key2=value2'
			const secondLine = 'key3=value3;'
			const text = `${firstLine}\n${secondLine}`
			const first = parser.parseLine(null, text, 0, firstLine.length)
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMOptions

			const updated = updateParser.parse(result, { text: ' ', rangeOffset: `${firstLine}\nkey3`.length, rangeLength: '='.length })

			expect(updated).toBeNull()
		})
	})
})
