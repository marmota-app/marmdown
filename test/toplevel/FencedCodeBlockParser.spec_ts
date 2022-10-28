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

import { TextContent } from "$markdown/MarkdownDocument"
import { MfMParsers } from "$markdown/MfMParsers"
import { FencedCodeBlockParser } from "$markdown/toplevel/FencedCodeBlockParser"

describe('FencedCodeBlockParser', () => {
	const parser = new FencedCodeBlockParser(new MfMParsers())

	it.skip('parses empty fenced code block', () => {
		const md = '```\n```'

		const result = parser.parse(md, 0, md.length)

		expect(result).toHaveProperty('type', 'Preformatted')
	})

	it.skip('returns null if text is not fenced', () => {
		const md = 'content'

		const result = parser.parse(md, 0, md.length)

		expect(result).toBeNull()
	})

	it.skip('parses text content until end of document when there is no closing fence', () => {
		const md = '```\ncontent\n'

		const result = parser.parse(md, 0, md.length)

		expect(result?.content).toHaveLength(2)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'content')
		expect(result?.content[1]).toHaveProperty('type', 'Newline')
	})

	it.skip('parses multiline-text content until end of document when there is no closing fence', () => {
		const md = '```\ncontent\nmore content'

		const result = parser.parse(md, 0, md.length)

		expect(result?.content).toHaveLength(3)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'content')
		expect(result?.content[1]).toHaveProperty('type', 'Newline')
		expect(result?.content[2]).toHaveProperty('type', 'Text')
		expect(result?.content[2]).toHaveProperty('content', 'more content')
	})

	it.skip('parses text content inside code block', () => {
		const md = '```\ncontent\n```'

		const result = parser.parse(md, 0, md.length)

		expect(result?.content).toHaveLength(2)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'content')
		expect(result?.content[1]).toHaveProperty('type', 'Newline')
	})

	it.skip('parses text content with empty lines inside code block', () => {
		const md = '```\ncontent\n\nmore content'

		const result = parser.parse(md, 0, md.length)

		expect(result?.content).toHaveLength(4)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('content', 'content')
		expect(result?.content[1]).toHaveProperty('type', 'Newline')
		expect(result?.content[2]).toHaveProperty('type', 'Newline')
		expect(result?.content[3]).toHaveProperty('type', 'Text')
		expect(result?.content[3]).toHaveProperty('content', 'more content')
	})

	it.skip('sets start and length correctly', () => {
		const md = 'before\n```\ncontent\n```\nafter\nand more'

		const result = parser.parse(md, 'before\n'.length, md.length-'before\n'.length)

		expect(result?.start).toEqual('before\n'.length)
		expect(result?.length).toEqual('```\ncontent\n```\n'.length)
	})

	it.skip('parses options after starting fence', () => {
		const md = '```{ foo }\ncontent\n'

		const result = parser.parse(md, 0, md.length)

		expect(result?.options).toHaveProperty('default', 'foo')
	})

	it.skip('parses github-style language indicator as default option', () => {
		const md = '```foo\ncontent\n'

		const result = parser.parse(md, 0, md.length)

		expect(result?.options).toHaveProperty('default', 'foo')
	})
	it.skip('parses multi-word github-style info string (language indicator + language) as default option + codeBlockInfo', () => {
		const md = '```   \tfoo bar baz   \ncontent\n'

		const result = parser.parse(md, 0, md.length)

		expect(result?.options).toHaveProperty('default', 'foo')
		expect(result?.options).toHaveProperty('codeBlockInfo', 'foo bar baz')
	})

	const fenceTestData: [string, string, string, string[]][] = [
		[ '````', '````', 'content\n~~~', ['content', '~~~']],
		[ '```', '', 'content', ['content', 'after closing']],
		[ '```', '``', 'content', ['content', '``', 'after closing']],
		[ '~~~', '~~~', 'content', ['content']],
		[ '~~~~~', '~~~~~', 'content', ['content']],
		[ '~~~', '~~~', '```', ['```']],
		[ '~~~', '', 'content', ['content', 'after closing']],
		[ '~~~', '~~', 'content', ['content', '~~', 'after closing']],
		[ '~~~', '```', 'content', ['content', '```', 'after closing']],
		[ '~~~', 'a~~~', 'content', ['content', 'a~~~', 'after closing']],
		[ '~~~', '~~~~~', 'content', ['content']],
	]
	fenceTestData.forEach(td => it.skip(`parses code block from ${td[0]} to ${td[1]} as ${JSON.stringify(td[3])}`, () => {
		const md = `before code block\n${td[0]}\n${td[2]}\n${td[1]}\nafter closing`

		const result = parser.parse(md, 'before code block\n'.length, md.length-'before code block\n'.length)

		const textsInCodeBlock = result?.content
			.filter(c => c.type==='Text')
			.map(c => (c as TextContent).content)

		expect(textsInCodeBlock).toEqual(td[3])
	}))
	const additionalEndTestData: [string, string, string, string[]][] = [
		//In MfM, thematic breaks and headlines end fenced code blocks. Otherwise,
		//starting a fenced code block would (temporarily) change the document
		//structure too much.
		[ '```', '---', 'ended by thematic break', ['ended by thematic break']],
		[ '```', '___', 'ended by thematic break', ['ended by thematic break']],
		[ '```', '***', 'ended by thematic break', ['ended by thematic break']],
		[ '```', '# ', 'ended by headline', ['ended by headline']],
		[ '```', '##', 'ended by headline', ['ended by headline']],
		[ '```', '##a', 'not ended, no headline', ['not ended, no headline', '##a', 'after closing']],
	]
	additionalEndTestData.forEach(td => it.skip(`parses code block from ${td[0]} to ${td[1]} as ${JSON.stringify(td[3])}`, () => {
		const md = `before code block\n${td[0]}\n${td[2]}\n${td[1]}\nafter closing`

		const result = parser.parse(md, 'before code block\n'.length, md.length-'before code block\n'.length)

		const textsInCodeBlock = result?.content
			.filter(c => c.type==='Text')
			.map(c => (c as TextContent).content)

		expect(textsInCodeBlock).toEqual(td[3])
	}))

	const lengthTestData: [string, number, number][] = [
		['```\ncontent\n```',                    0,                 '```\ncontent\n```'.length],
		['before\n```\ncontent\n```\nafter',     'before\n'.length, '```\ncontent\n```\n'.length],
		['before\n```\ncontent\n```blah\nafter', 'before\n'.length, '```\ncontent\n```blah\n'.length],
		['```\ncontent',                          0,                '```\ncontent'.length],
	]
	lengthTestData.forEach(([md, start, expectedLength])=>it.skip(`produces result of length ${expectedLength} for markdown "${md}"`, () => {
		const result = parser.parse(md, start, md.length-start)

		expect(result?.length).toEqual(expectedLength)
	}))

	const textTestData: [string, number, string][] = [
		['```\ncontent\n```',                    0,                 '```\ncontent\n```'],
		['before\n```\ncontent\n```\nafter',     'before\n'.length, '```\ncontent\n```\n'],
		['before\n```\ncontent\n```blah\nafter', 'before\n'.length, '```\ncontent\n```blah\n'],
		['```\ncontent',                          0,                '```\ncontent'],
	]
	textTestData.forEach(([md, start, expectedText])=>it.skip(`produces result of length ${expectedText} for markdown "${md}"`, () => {
		const result = parser.parse(md, start, md.length-start)

		expect(result?.asText).toEqual(expectedText)
	}))
})
