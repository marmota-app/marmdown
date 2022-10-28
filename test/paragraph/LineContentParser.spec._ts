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
import { MfMParsers } from "$markdown/MfMParsers"
import { LineContentParser } from "$markdown/paragraph/LineContentParser"

describe('LineContentParser', () => {
	const lineParser = new LineContentParser(new MfMParsers())
	function parse(text: string, start: number = 0) {
		return lineParser.parse(text, start, text.length)
	}

	it.skip('parses string until the end when there is no newline', () => {
		const result = parse('lorem ipsum')

		expect(result?.parts).toHaveLength(1)
		expect(result?.parts[0]).toHaveProperty('type', 'Text')
		expect(result?.parts[0]).toHaveProperty('content', 'lorem ipsum')
	})

	const newLineTestData = [ ['\n', '\\n'], ['\r', '\\r'], ['\r\n', '\\r\\n'], ]
	newLineTestData.forEach(([separator, name]) => it.skip(`parses string until newline separator "${name}"`, () => {
		const result = parse(`lorem${separator}ipsum`)

		expect(result).toHaveProperty('length', `lorem${separator}`.length)
		expect(result?.parts).toHaveLength(2)
		expect(result?.parts[0]).toHaveProperty('type', 'Text')
		expect(result?.parts[0]).toHaveProperty('content', 'lorem')
		expect(result?.parts[1]).toHaveProperty('type', 'Newline')
	}))

	const noLineStartData = [
		'# ', '#{', '## ', '##{', '### ', '###{', '#### ', '####{',
	]
	noLineStartData.forEach(td => it.skip(`does not parse line that starts with toplevel element "${td}"`, () => {
		const result = parse(`${td}lorem ipsum`)

		expect(result).toBeNull()
	}))

	const emptyLineData = [
		'\n', '\r\n', '         \n', '\t\r\n', '   \t  \t  \n',
	]
	emptyLineData.forEach(td => it.skip(`does not parse empty line "${td.replace('\r', '\\r').replace('\n', '\\n').replace('\t', '\\t')}" (it ends the current paragraph)`, () => {
		const result = parse(`${td}`)

		expect(result).toBeNull()
	}))
})
