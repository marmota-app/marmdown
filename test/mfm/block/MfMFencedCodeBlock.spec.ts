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
import { MfMFencedCodeBlock, MfMFencedCodeBlockParser } from "$mfm/block/MfMFencedCodeBlock"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { createOptionsParser } from "../options/createOptionsParser"

function createFencedCodeBlockParser() {
	const idGenerator = new NumberedIdGenerator()
	const MfMText = new MfMTextParser({ idGenerator, })
	const MfMOptions = createOptionsParser(idGenerator)
	const parser = new MfMFencedCodeBlockParser({ MfMText, MfMOptions, idGenerator, })
	return { parser, idGenerator, }
}
function parseCodeBlock(lines: string[]) {
	const { parser, idGenerator } = createFencedCodeBlockParser()

	const text = lines.join('\n')
	const result = lines.reduce(
		(r: { value: MfMFencedCodeBlock | null, start: number, }, line) => ({
			value: parser.parseLine(r.value, text, r.start, line.length),
			start: r.start+line.length+1,
		}),
		{ value: null, start: 0, }
	).value

	return { result, parser, idGenerator, }
}

describe('MfMFencedCodeBlock', () => {
	describe('parsing the content', () => {
		['```', '`````', '   ```'].forEach(token => it(`parses empty fenced code block until the end of the document (started with ${token})`, () => {
			const { result } = parseCodeBlock([
				token
			])

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(0)

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', token)
		}));

		['`', '``'].forEach(token => it(`does not parse fenced code block when started by less than two backticks (${token})`, () => {
			const { result } = parseCodeBlock([
				token
			])
			expect(result).toBeNull()
		}))

		it('adds the info string to the options of the code block', () => {
			const { result } = parseCodeBlock([
				' ``` lang and more info   '
			])

			expect(result).toHaveProperty('type', 'fenced-code-block')

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', ' ``` lang and more info   ')

			expect(result?.options.get('default')).toEqual('lang')
			expect(result?.options.get('info')).toEqual('lang and more info')
		})

		it('returns null when the token is consist of backticks and the info string contains backticks', () => {
			const { result } = parseCodeBlock([
				'``` not a code block`'
			])
			expect(result).toBeNull()
		})

		it('adds code block where the token consists of tildes', () => {
			const { result } = parseCodeBlock([
				'~~~ lang and more info ~` are allowed   '
			])

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(0)

			expect(result?.lines).toHaveLength(1)
			expect(result?.lines[0]).toHaveProperty('asText', '~~~ lang and more info ~` are allowed   ')

			expect(result?.options.get('default')).toEqual('lang')
			expect(result?.options.get('info')).toEqual('lang and more info ~` are allowed')
		})

		it('adds content to the code block', () => {
			const lines = [
				'```',
				'line 1',
				'line 2',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')
			expect(result?.continueWithNextLine).toEqual(true)

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})

		it('ends the block with same-length delimiter', () => {
			const lines = [
				'```',
				'line 1',
				'line 2',
				'```',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')
			expect(result?.continueWithNextLine).toEqual(false)

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})
		it('ends the block with longer delimiter', () => {
			const lines = [
				' ```',
				'line 1',
				'  line 2',
				'  ````   \t ',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', ' line 2')
			expect(result?.continueWithNextLine).toEqual(false)

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})
		it('does not end the block with shorter delimiter', () => {
			const lines = [
				'```',
				'line 1',
				'line 2',
				'``',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(3)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')
			expect(result?.content[2]).toHaveProperty('text', '``')
			expect(result?.continueWithNextLine).toEqual(true)

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})
		it('does not end the block with text after delimiter', () => {
			const lines = [
				'```',
				'line 1',
				'line 2',
				'``` text after',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(3)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')
			expect(result?.content[2]).toHaveProperty('text', '``` text after')
			expect(result?.continueWithNextLine).toEqual(true)

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})
	})
	describe('parsing options', () => {
		it('parses options and ignored remaining info string', () => {
			const lines = [
				'   ```{ the-language; key2 = value2} remaining info string',
				'line 1',
				'line 2',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')
			expect(result?.continueWithNextLine).toEqual(true)

			expect(result?.options.get('default')).toEqual('the-language')
			expect(result?.options.get('key2')).toEqual('value2')

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})
		it('parses multi-line options and ignored remaining info string', () => {
			const lines = [
				'```{ the-language; key2 = value2',
				'key3 = value3} remaining info string',
				'line 1',
				'line 2',
			]
			const { result } = parseCodeBlock(lines)

			expect(result).toHaveProperty('type', 'fenced-code-block')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('text', 'line 1')
			expect(result?.content[1]).toHaveProperty('text', 'line 2')
			expect(result?.continueWithNextLine).toEqual(true)

			expect(result?.options.get('default')).toEqual('the-language')
			expect(result?.options.get('key2')).toEqual('value2')
			expect(result?.options.get('key3')).toEqual('value3')

			expect(result?.lines).toHaveLength(lines.length)
			lines.forEach((l, i) => expect(result?.lines[i]).toHaveProperty('asText', l))
		})
	})
	describe.skip('parsing updates', () => {})
})
