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
import { MfMGeneralPurposeBlock, MfMGeneralPurposeBlockParser } from "$mfm/block/MfMGeneralPurposeBlock"
import { MfMHeading } from "$mfm/block/MfMHeading"
import { MfMParagraph, MfMParagraphParser } from "$mfm/block/MfMParagraph"
import { MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { EmptyElementParser } from "$parser/EmptyElementParser"
import { createOptionsParser } from "../options/createOptionsParser"
import { createHeadingParser } from "./createHeadingParser"

function createGeneralPurposeBlockParser() {
	const idGenerator = new NumberedIdGenerator()
	const MfMContentLine = new MfMContentLineParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator }), ], })
	const { headingParser } = createHeadingParser()
	const MfMOptions = createOptionsParser(idGenerator)
	const MfMParagraph = new MfMParagraphParser({ idGenerator, MfMContentLine, allBlocks: [headingParser] })
	const EmptyElement = new EmptyElementParser({ idGenerator })
	const parser = new MfMGeneralPurposeBlockParser({ idGenerator, MfMOptions, EmptyElement, allBlocks: [ EmptyElement, headingParser, MfMParagraph, ] })
	return parser
}
describe('MfMGeneralPurposeBlock parser', () => {
	describe('parsing the content of single-line blocks', () => {
		it('parses an empty block', () => {
			const parser = createGeneralPurposeBlockParser()

			const result = parser.parseLine(null, '>', 0, '>'.length)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', 'block-quote')
		});
		['>', '> '].forEach(start => it(`adds the first line (starting ${start})`, () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `${start}text content`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')
		}))
		it('adds a heading as first line of a block quote', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `># text content`
			const result = parser.parseLine(null, text, 0, text.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'section')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'heading')
			const heading = result?.content[0].content[0] as unknown as MfMHeading
			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'text content')
		})
	})
	describe('parsing the content of multi-line blocks', () => {
		it('parses the second line of a paragraph inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> text content\n> more content`
			const first = parser.parseLine(null, text, 0, '> text content'.length)
			const result = parser.parseLine(first, text, '> text content\n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')

			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(2)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(paragraph?.content[1]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[1].content[0]).toHaveProperty('text', 'more content')
		})
		it('parses a second paragraph inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> text content\n>\n> more content`
			const first = parser.parseLine(null, text, 0, '> text content'.length)
			const second = parser.parseLine(first, text, '> text content\n'.length, '>'.length)
			const result = parser.parseLine(second, text, '> text content\n>\n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(3)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			expect(result?.content[1]).toHaveProperty('type', '--empty--')
			expect(result?.content[2]).toHaveProperty('type', 'paragraph')

			const paragraph1 = result?.content[0] as unknown as MfMParagraph
			expect(paragraph1.content).toHaveLength(1)

			expect(paragraph1?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph1?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph1?.content[0].content[0]).toHaveProperty('text', 'text content')

			const paragraph2 = result?.content[2] as unknown as MfMParagraph
			expect(paragraph2.content).toHaveLength(1)

			expect(paragraph2?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph2?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph2?.content[0].content[0]).toHaveProperty('text', 'more content')
		})

		it('parses a heading after a paragraph inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> text content\n> # heading content`
			const first = parser.parseLine(null, text, 0, '> text content'.length)
			const result = parser.parseLine(first, text, '> text content\n'.length, '> # heading content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)

			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(1)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(result?.content[1]).toHaveProperty('type', 'section')
			expect(result?.content[1].content[0]).toHaveProperty('type', 'heading')
			const heading = result?.content[1].content[0] as unknown as MfMHeading
			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'heading content')
		})
		it('parses the second line of a two-line heading inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `># text content  \n> more content`
			const first = parser.parseLine(null, text, 0, '># text content  '.length)
			const result = parser.parseLine(first, text, '># text content  \n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'section')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'heading')

			const heading = result?.content[0].content[0] as unknown as MfMHeading
			expect(heading.content).toHaveLength(2)

			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(heading?.content[1]).toHaveProperty('type', 'content-line')
			expect(heading?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[1].content[0]).toHaveProperty('text', 'more content')
		})

		it('parses a two-line paragraph after a heading inside a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = `> # heading content\n> text content\n> more content`
			const first = parser.parseLine(null, text, 0, '> # heading content'.length)
			const second = parser.parseLine(first, text, '> # heading content\n'.length, '> text content'.length)
			const result = parser.parseLine(second, text, '> # heading content\n> text content\n'.length, '> more content'.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveLength(2)

			expect(result?.content[0]).toHaveProperty('type', 'section')
			expect(result?.content[0].content[0]).toHaveProperty('type', 'heading')

			const heading = result?.content[0].content[0] as unknown as MfMHeading
			expect(heading.content).toHaveLength(1)

			expect(heading?.content[0]).toHaveProperty('type', 'content-line')
			expect(heading?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(heading?.content[0].content[0]).toHaveProperty('text', 'heading content')

			expect(result?.content[1]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[1] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(2)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'text content')

			expect(paragraph?.content[1]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[1].content[0]).toHaveProperty('text', 'more content')
		})
	})
	describe('parsing content lines', () => {
		it('contains the starting block character of an empty block', () => {
			const parser = createGeneralPurposeBlockParser()

			const result = parser.parseLine(null, '>', 0, 1) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(1)
			const line = result.lines[0]

			expect(line).toHaveProperty('start', 0)
			expect(line).toHaveProperty('length', 1)
			expect(line).toHaveProperty('asText', `>`)
		})

		it('contains the empty line when a block consists only of an empty line', () => {
			const parser = createGeneralPurposeBlockParser()

			const result = parser.parseLine(null, '>   ', 0, 4) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(1)
			const line = result.lines[0]

			expect(line).toHaveProperty('start', 0)
			expect(line).toHaveProperty('length', 4)
			expect(line).toHaveProperty('asText', `>   `)

			expect(line.content).toHaveLength(2)

			expect(line.content[0]).toHaveProperty('start', 0)
			expect(line.content[0]).toHaveProperty('length', 2)
			expect(line.content[0]).toHaveProperty('asText', `> `)

			expect(line.content[1]).toHaveProperty('start', 2)
			expect(line.content[1]).toHaveProperty('length', 2)
			expect(line.content[1]).toHaveProperty('asText', `  `)
		})

		it('contains the full line of a single-line block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = '>\ta single line block'
			const result = parser.parseLine(null, text, 0, text.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(1)
			const line = result.lines[0]

			expect(line.content).toHaveLength(2)

			expect(line.content[0]).toHaveProperty('start', 0)
			expect(line.content[0]).toHaveProperty('length', 2)
			expect(line.content[0]).toHaveProperty('asText', `>\t`)

			expect(line.content[1]).toHaveProperty('start', 2)
			expect(line.content[1]).toHaveProperty('length', 'a single line block'.length)
			expect(line.content[1]).toHaveProperty('asText', 'a single line block')
		})

		it('contains the full second line of a two-line block', () => {
			const parser = createGeneralPurposeBlockParser()

			const text = '>\tfirst line\n> second line'
			const first = parser.parseLine(null, text, 0, '>\tfirst line'.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(first, text, '>\tfirst line\n'.length, '> second line'.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(2)
			const line = result.lines[1]

			expect(line.content).toHaveLength(2)

			expect(line.content[0]).toHaveProperty('start', '>\tfirst line\n'.length)
			expect(line.content[0]).toHaveProperty('length', 2)
			expect(line.content[0]).toHaveProperty('asText', `> `)

			expect(line.content[1]).toHaveProperty('start', '>\tfirst line\n'.length + 2)
			expect(line.content[1]).toHaveProperty('length', 'second line'.length)
			expect(line.content[1]).toHaveProperty('asText', 'second line')
		})
	})

	describe('adding options', () => {
		it('adds options block to the beginning of a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const firstLine = '>{ default value;key2=  value2 } first line'
			const secondLine = '> second line'
			const text = `${firstLine}\n${secondLine}`

			const first = parser.parseLine(null, text, 0, firstLine.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMGeneralPurposeBlock

			expect(result.options).not.toBeNull()
			expect(result.options.get('default')).toEqual('default value')
			expect(result.options.get('key2')).toEqual('value2')

			//make sure parsing the contena **after** options works
			expect(result.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(2)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'first line')

			expect(paragraph?.content[1]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[1].content[0]).toHaveProperty('text', 'second line')
		})

		it('uses the correct line start when there are options', () => {
			const parser = createGeneralPurposeBlockParser()

			const firstLine = '>{ default value;key2=  value2 } first line'
			const secondLine = '> second line'
			const text = `${firstLine}\n${secondLine}`

			const first = parser.parseLine(null, text, 0, firstLine.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMGeneralPurposeBlock

			expect(result.lines[0].content[0].asText).toEqual('>')
			expect(result.lines[0].content[0].length).toEqual(1)
		})

		it('parses both lines correctly when there is content after the options', () => {
			const parser = createGeneralPurposeBlockParser()

			const firstLine = '>{ default value;key2=  value2 } first line'
			const secondLine = '> second line'
			const text = `${firstLine}\n${secondLine}`

			const first = parser.parseLine(null, text, 0, firstLine.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(2)

			expect(result.lines[0].content).toHaveLength(4)
			expect(result.lines[0].content[0].asText).toEqual('>')
			expect(result.lines[0].content[0].start).toEqual(0)
			expect(result.lines[0].content[1].asText).toEqual('{ default value;key2=  value2 }')
			expect(result.lines[0].content[1].start).toEqual(1)
			expect(result.lines[0].content[2].asText).toEqual(' ')
			expect(result.lines[0].content[2].start).toEqual(32)
			expect(result.lines[0].content[3].asText).toEqual('first line')
			expect(result.lines[0].content[3].start).toEqual(33)

			expect(result.lines[1].content).toHaveLength(2)
			expect(result.lines[1].content[0].asText).toEqual('> ')
			expect(result.lines[1].content[1].asText).toEqual('second line')

		})

		it('adds multi-line options block to the beginning of a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const firstLine = '>{ default value;key2=  value2 '
			const secondLine = '> key3 = value3} first block line'
			const thirdLine = '> second block line'
			const text = `${firstLine}\n${secondLine}\n${thirdLine}`

			const first = parser.parseLine(null, text, 0, firstLine.length) as MfMGeneralPurposeBlock
			const second = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(second, text, firstLine.length+1+secondLine.length+1, thirdLine.length) as MfMGeneralPurposeBlock

			expect(result.options).not.toBeNull()
			expect(result.options.get('default')).toEqual('default value')
			expect(result.options.get('key2')).toEqual('value2')
			expect(result.options.get('key3')).toEqual('value3')

			//make sure parsing the content **after** options works
			expect(result.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'paragraph')
			const paragraph = result?.content[0] as unknown as MfMParagraph
			expect(paragraph.content).toHaveLength(2)

			expect(paragraph?.content[0]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[0].content[0]).toHaveProperty('text', 'first block line')

			expect(paragraph?.content[1]).toHaveProperty('type', 'content-line')
			expect(paragraph?.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraph?.content[1].content[0]).toHaveProperty('text', 'second block line')
		})

		it('adds the correct line representations for multi-line options block to the beginning of a block', () => {
			const parser = createGeneralPurposeBlockParser()

			const firstLine = '>{ default value;key2=  value2 '
			const secondLine = '> key3 = value3} first block line'
			const thirdLine = '> second block line'
			const text = `${firstLine}\n${secondLine}\n${thirdLine}`

			const first = parser.parseLine(null, text, 0, firstLine.length) as MfMGeneralPurposeBlock
			const second = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(second, text, firstLine.length+1+secondLine.length+1, thirdLine.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(3)
			expect(result.lines[0].asText).toEqual(firstLine)
			expect(result.lines[1].asText).toEqual(secondLine)
			expect(result.lines[2].asText).toEqual(thirdLine)
		})
		it('adds the correct line representations for multi-line options block to the beginning of a block, with no content after options', () => {
			const parser = createGeneralPurposeBlockParser()

			const firstLine  = '>{ default value;key2=  value2 '
			const secondLine = '> key3 = value3}'
			const thirdLine  = '> first block line'
			const text = `${firstLine}\n${secondLine}\n${thirdLine}`

			const first = parser.parseLine(null, text, 0, firstLine.length) as MfMGeneralPurposeBlock
			const second = parser.parseLine(first, text, firstLine.length+1, secondLine.length) as MfMGeneralPurposeBlock
			const result = parser.parseLine(second, text, firstLine.length+1+secondLine.length+1, thirdLine.length) as MfMGeneralPurposeBlock

			expect(result.lines).toHaveLength(3)
			expect(result.lines[0].asText).toEqual(firstLine)
			expect(result.lines[1].asText).toEqual(secondLine)
			expect(result.lines[2].asText).toEqual(thirdLine)
		})

	})
})
