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
import { ParagraphParser } from "$markdown/toplevel/ParagraphParser"

describe('ParagraphParser', () => {
	const paragraphParser = new ParagraphParser()
	function parse(md: string, start: number = 0) {
		return paragraphParser.parse(md, start, md.length-start)
	}

	it('parses single line of text as paragraph', () => {
		const result = parse('text content')

		expect(result).toHaveProperty('startIndex', 0)
		expect(result?.content).toHaveProperty('content')
		expect(result?.content.content).toHaveLength(1)
		expect(result?.content.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content.content[0]).toHaveProperty('content', 'text content')
	})

	it('parses single line of text, not at the start of the string', () => {
		const result = parse('     \ntext content', 6)

		expect(result).toHaveProperty('startIndex', 6)
		expect(result).toHaveProperty('length', 'text content'.length)

		expect(result?.content).toHaveProperty('content')
		expect(result?.content.content).toHaveLength(1)
		expect(result?.content.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content.content[0]).toHaveProperty('content', 'text content')
	})

	const newLineTestData = [ ['\n', '\\n'], ['\r', '\\r'], ['\r\n', '\\r\\n'], ]
	newLineTestData.forEach(([separator, name]) => it(`parses "NewLine" in between two lines of text content separated by ${name}`, () => {
		const result = parse(`lorem${separator}ipsum`)

		expect(result?.content).toHaveProperty('content')
		expect(result?.content.content).toHaveLength(3)
		expect(result?.content.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content.content[0]).toHaveProperty('content', 'lorem')

		expect(result?.content.content[1]).toHaveProperty('type', 'Newline')

		expect(result?.content.content[2]).toHaveProperty('type', 'Text')
		expect(result?.content.content[2]).toHaveProperty('content', 'ipsum')
	}))
})
