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
import { ParagraphParser } from "$markdown/toplevel/ParagraphParser"

describe('ParagraphParser', () => {
	const paragraphParser = new ParagraphParser(new MfMParsers())
	function parse(md: string, start: number = 0) {
		return paragraphParser.parse(null, md, start, md.length-start)
	}

	it.skip('parses single line of text as paragraph', () => {
		const result = parse('text content')[0]

		expect(result).toHaveProperty('start', 0)
		expect(result).toHaveProperty('content')
		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'text content')
	})

	it.skip('parses single line of text, not at the start of the string', () => {
		const result = parse('     \ntext content', 6)[0]

		expect(result).toHaveProperty('start', 6)
		expect(result).toHaveProperty('length', 'text content'.length)

		expect(result).toHaveProperty('content')
		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'text content')
	})

	const newLineTestData = [ ['\n', '\\n'], ['\r', '\\r'], ['\r\n', '\\r\\n'], ]
	newLineTestData.forEach(([separator, name]) => it.skip(`parses "NewLine" in between two lines of text content separated by ${name}`, () => {
		const result = parse(`lorem${separator}ipsum`)[0]

		expect(result).toHaveProperty('content')
		expect(result?.content).toHaveLength(3)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'lorem')

		expect(result?.content[1]).toHaveProperty('type', 'Newline')

		expect(result?.content[2]).toHaveProperty('type', 'Text')
		expect(result?.content[2]).toHaveProperty('content', 'ipsum')
	}))

	it.skip('parses paragraph only until paragraph end denoted by "\\n\\n"', () => {
		const result = parse(`lorem\n\nipsum`)[0]

		//expect(result?.length).toEqual('lorem'.length) FIXME skipping until we have a better, line-based parser.
		expect(result).toHaveProperty('content')
		//expect(result?.content).toHaveLength(1) FIXME skipping until we have a better, line-based parser.
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'lorem')
	})
	it.skip('parses second paragraph', () => {
		const result = parse(`lorem\n\nipsum`, 'lorem\n\n'.length)[0]

		expect(result?.length).toEqual('ipsum'.length)
		expect(result).toHaveProperty('content')
		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'ipsum')
	})
	it.skip('parses paragraph only until paragraph end denoted by heading', () => {
		const result = parse(`lorem\n# ipsum`)[0]

		expect(result).toHaveProperty('content')
		expect(result?.content).toHaveLength(2)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'lorem')

		expect(result?.content[1]).toHaveProperty('type', 'Newline')
	})

	describe('partial parsing of paragraphs', () => {
		//TODO add tests
	})
})
