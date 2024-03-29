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
import { MfMHeading } from "../../../src/mfm/block/MfMHeading"
import { MfMSection } from "../../../src/mfm/block/MfMSection"
import { createHeadingParser } from "./createHeadingParser"

describe('MfMHeading parser', () => {
	describe('parsing the content', () => {
		['#', '##', '###', '####', '#####', '######'].forEach(token => {
			it(`creates a section with the heading\'s level "${token}", containing the heading`, () => {
				const { headingParser, sectionParser, } = createHeadingParser()

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('type', 'section')
				expect(result).toHaveProperty('level', token.length)
			})
			it(`creates a heading with level ${token}`, () => {
				const { headingParser, } = createHeadingParser()

				const text = `${token} Heading Text`
				const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0]).toHaveProperty('level', token.length)
			})
			it(`creates an empty heading with leve ${token}`, () => {
				const { headingParser, } = createHeadingParser()

				const text = `${token}`
				const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0]).toHaveProperty('level', token.length)
				expect(result.content[0].content).toHaveLength(0)
			})
			it(`creates an empty heading with leve ${token}, skipping the spaces`, () => {
				const { headingParser, } = createHeadingParser()

				const text = `${token} `
				const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0]).toHaveProperty('level', token.length)
				expect(result.content[0].content).toHaveLength(0)
			})
		})
		it('parses simple text as the heading text', () => {
			const { headingParser, } = createHeadingParser()

			const text = `# Heading Text`
			const result = headingParser.parseLine(null, text, 0, text.length) as MfMSection

			expect(result.content[0].content).toHaveLength(1)
			const headingContent = result.content[0].content[0]
			expect(headingContent).toHaveProperty('type', '--content-line--')
			expect(headingContent.content).toHaveLength(1)
			expect(headingContent.content[0]).toHaveProperty('text', 'Heading Text')
		})
	})
	describe('multi-line headings', () => {
		it('can parse a heading with two lines', () => {
			const { headingParser, } = createHeadingParser()

			const text = `# Heading Text  \nsecond line`
			let result = headingParser.parseLine(null, text, 0, '# Heading Text  '.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '# Heading Text  \n'.length, 'second line'.length) as MfMSection

			expect(result.content[0].content).toHaveLength(2)

			const headingLine1 = result.content[0].content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = result.content[0].content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')
		})

		it('does not parse heading as multi-line when there are no spaces at the end', () => {
			const { headingParser, } = createHeadingParser()

			const text = `# Heading Text\nNOT the second line`
			let result = headingParser.parseLine(null, text, 0, '# Heading Text'.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '# Heading Text\n'.length, 'NOT the second line'.length) as MfMSection

			expect(result).toBeNull()
		})

		it('can parse a heading with three lines', () => {
			const { headingParser, } = createHeadingParser()

			const first = '# Heading Text  '
			const second = 'second line  '
			const third = 'even a third line'
			const text = `${first}\n${second}\n${third}`
			let result = headingParser.parseLine(null, text, 0, first.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, `${first}\n`.length, second.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, `${first}\n${second}\n`.length, third.length) as MfMSection

			expect(result.content[0].content).toHaveLength(3)

			const headingLine1 = result.content[0].content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = result.content[0].content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')

			const headingLine3 = result.content[0].content[2]
			expect(headingLine3).toHaveProperty('type', '--content-line--')
			expect(headingLine3.content).toHaveLength(1)
			expect(headingLine3.content[0]).toHaveProperty('text', 'even a third line')
		})

		it('skips all spaces at the beginning of a line', () => {
			const { headingParser, } = createHeadingParser()

			const first = '#\t  \tHeading Text  '
			const second = '   \t\tsecond line  '
			const third = ' even a third line'
			const text = `${first}\n${second}\n${third}`
			let result = headingParser.parseLine(null, text, 0, first.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, `${first}\n`.length, second.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, `${first}\n${second}\n`.length, third.length) as MfMSection

			expect(result.content[0].content).toHaveLength(3)

			const headingLine1 = result.content[0].content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = result.content[0].content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')

			const headingLine3 = result.content[0].content[2]
			expect(headingLine3).toHaveProperty('type', '--content-line--')
			expect(headingLine3.content).toHaveLength(1)
			expect(headingLine3.content[0]).toHaveProperty('text', 'even a third line')
		})
	})

	describe('parsing the content lines', () => {
		['#', '##', '###', '####', '#####', '######'].forEach(token => {
			it(`adds the only line of a single-line "${token}" heading to the line structure`, () => {
				const { headingParser, } = createHeadingParser()
	
				const text = `${token} Heading Text`
				const section = headingParser.parseLine(null, text, 0, text.length) as MfMSection
				const result = section.content[0] as MfMHeading
	
				expect(result.lines).toHaveLength(1)
				const line = result.lines[0]
	
				expect(line.content).toHaveLength(3)
	
				expect(line.content[0]).toHaveProperty('start', 0)
				expect(line.content[0]).toHaveProperty('length', token.length)
				expect(line.content[0]).toHaveProperty('asText', `${token}`)
	
				expect(line.content[2]).toHaveProperty('start', token.length + 1)
				expect(line.content[2]).toHaveProperty('length', 'Heading Text'.length)
				expect(line.content[2]).toHaveProperty('asText', 'Heading Text')
			})
		})

		it('adds the lines of a three-line "###" heading to the line structure', () => {
			const { headingParser, } = createHeadingParser()
	
			const first = '### Heading Text  '
			const second = 'second line  '
			const third = 'even a third line'
			const text = `${first}\n${second}\n${third}`
			let section = headingParser.parseLine(null, text, 0, first.length) as MfMSection
			section = headingParser.parseLine(section.content[0] as MfMHeading, text, `${first}\n`.length, second.length) as MfMSection
			section = headingParser.parseLine(section.content[0] as MfMHeading, text, `${first}\n${second}\n`.length, third.length) as MfMSection
			const result = section.content[0] as MfMHeading

			expect(result.lines).toHaveLength(3)
			let line = result.lines[0]

			expect(line).toHaveProperty('asText', '### Heading Text  ')
			expect(line.content).toHaveLength(4)

			expect(line.content[0]).toHaveProperty('start', 0)
			expect(line.content[0]).toHaveProperty('length', 3)
			expect(line.content[0]).toHaveProperty('asText', `###`)

			expect(line.content[2]).toHaveProperty('start', 4)
			expect(line.content[2]).toHaveProperty('length', 'Heading Text'.length)
			expect(line.content[2]).toHaveProperty('asText', 'Heading Text')

			expect(line.content[3]).toHaveProperty('asText', '  ')

			line = result.lines[1]
			expect(line).toHaveProperty('asText', 'second line  ')
			expect(line.content).toHaveLength(2)
			expect(line.content[1]).toHaveProperty('asText', '  ')

			line = result.lines[2]
			expect(line).toHaveProperty('asText', 'even a third line')
			expect(line.content).toHaveLength(1)

			expect(line.content[0]).toHaveProperty('start', `${first}\n${second}\n`.length)
			expect(line.content[0]).toHaveProperty('length', third.length)
			expect(line.content[0]).toHaveProperty('asText', third)
		})
	})

	describe('parsing updates', () => {
		it('can change the text of a parsed heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const text = '---ignore me---# the original heading---ignore me---'
			const originalSection = headingParser.parseLine(null, text, '---ignore me---'.length, '# the original heading'.length) as MfMSection
			const updatedSection = updateParser.parse(originalSection, { text: 'updated', rangeOffset: '---ignore me---# the '.length, rangeLength: 'original'.length, }) as MfMSection

			expect(updatedSection).not.toBeNull()
			expect(updatedSection.lines).toHaveLength(1)
			expect(updatedSection.lines[0]).toHaveProperty('asText', '# the updated heading')
			expect(updatedSection.lines[0]).toHaveProperty('start', '---ignore me---'.length)
			expect(updatedSection.lines[0]).toHaveProperty('length', '# the updated heading'.length)

			const updatedHeading = updatedSection?.content[0] as MfMHeading
			expect(updatedHeading).not.toBeNull()
			expect(updatedHeading.lines).toHaveLength(1)
			expect(updatedSection.lines[0].content).toHaveLength(1)
			expect(updatedSection.lines[0].content[0]).toEqual(updatedHeading.lines[0])
			expect(updatedHeading.lines[0].content).toHaveLength(3)

			expect(updatedHeading.lines[0].content[2]).toHaveProperty('asText', 'the updated heading')
			expect(updatedHeading.lines[0].content[2]).toHaveProperty('start', '---ignore me---'.length + '# '.length)
			expect(updatedHeading.lines[0].content[2]).toHaveProperty('length', 'the updated heading'.length)
		})

		it('cannot change the heading into a simple paragraph', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const text = '---ignore me---# the original heading---ignore me---'
			const originalSection = headingParser.parseLine(null, text, '---ignore me---'.length, '# the original heading'.length) as MfMSection

			const updatedSection = updateParser.parse(originalSection, { text: '', rangeOffset: '---ignore me---'.length, rangeLength: 1, }) as MfMSection

			expect(updatedSection).toBeNull()
		})

		it('cannot change the level of a heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const text = '---ignore me---# the original heading---ignore me---'
			const originalSection = headingParser.parseLine(null, text, '---ignore me---'.length, '# the original heading'.length) as MfMSection

			const updatedSection = updateParser.parse(originalSection, { text: '#', rangeOffset: '---ignore me---#'.length, rangeLength: 0, }) as MfMSection

			expect(updatedSection).toBeNull()
		})

		it('can change the first line of a three-line heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const first = '### Heading Text  '
			const second = 'second line  '
			const third = 'even a third line'
			const text = `${first}\n${second}\n${third}`
			let section = headingParser.parseLine(null, text, 0, first.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, `${first}\n`.length, second.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, `${first}\n${second}\n`.length, third.length) as MfMSection

			const updatedSection = updateParser.parse(section, { text: 'The h', rangeOffset: 4, rangeLength: 1, }) as MfMSection

			expect(updatedSection).not.toBeNull()
			expect(updatedSection.lines).toHaveLength(3)
			expect(updatedSection.lines[0]).toHaveProperty('asText', '### The heading Text  ')
			expect(updatedSection.lines[0]).toHaveProperty('start', 0)
			expect(updatedSection.lines[0]).toHaveProperty('length', '### The heading Text  '.length)
			expect(updatedSection.lines[1]).toHaveProperty('asText', 'second line  ')
			expect(updatedSection.lines[2]).toHaveProperty('asText', 'even a third line')

			const updatedHeading = updatedSection?.content[0] as MfMHeading
			expect(updatedHeading).not.toBeNull()
			expect(updatedHeading.lines).toHaveLength(3)
			expect(updatedSection.lines[0].content).toHaveLength(1)
			expect(updatedSection.lines[0].content[0]).toEqual(updatedHeading.lines[0])
			expect(updatedHeading.lines[0].content).toHaveLength(4)

			expect(updatedSection.lines[1].content).toHaveLength(1)
			expect(updatedSection.lines[1].content[0]).toEqual(updatedHeading.lines[1])
			expect(updatedHeading.lines[1].content).toHaveLength(2)

			expect(updatedSection.lines[2].content).toHaveLength(1)
			expect(updatedSection.lines[2].content[0]).toEqual(updatedHeading.lines[2])
			expect(updatedHeading.lines[2].content).toHaveLength(1)
		})
		it('can change the second line of a three-line heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const first = '### Heading Text  '
			const second = 'second line  '
			const third = 'even a third line'
			const text = `${first}\n${second}\n${third}`
			let section = headingParser.parseLine(null, text, 0, first.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, `${first}\n`.length, second.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, `${first}\n${second}\n`.length, third.length) as MfMSection

			const updatedSection = updateParser.parse(section, { text: 'The ', rangeOffset: `${first}\n`.length, rangeLength: 0, }) as MfMSection

			expect(updatedSection).not.toBeNull()
			expect(updatedSection.lines).toHaveLength(3)
			expect(updatedSection.lines[1]).toHaveProperty('asText', 'The second line  ')
			expect(updatedSection.lines[1]).toHaveProperty('start', `${first}\n`.length)
			expect(updatedSection.lines[1]).toHaveProperty('length', 'The second line  '.length)
			expect(updatedSection.lines[0]).toHaveProperty('asText', '### Heading Text  ')
			expect(updatedSection.lines[2]).toHaveProperty('asText', 'even a third line')

			const updatedHeading = updatedSection?.content[0] as MfMHeading
			expect(updatedHeading).not.toBeNull()
			expect(updatedHeading.lines).toHaveLength(3)
			expect(updatedSection.lines[0].content).toHaveLength(1)
			expect(updatedSection.lines[0].content[0]).toEqual(updatedHeading.lines[0])
			expect(updatedHeading.lines[0].content).toHaveLength(4)

			expect(updatedSection.lines[1].content).toHaveLength(1)
			expect(updatedSection.lines[1].content[0]).toEqual(updatedHeading.lines[1])
			expect(updatedHeading.lines[1].content).toHaveLength(2)

			expect(updatedSection.lines[2].content).toHaveLength(1)
			expect(updatedSection.lines[2].content[0]).toEqual(updatedHeading.lines[2])
			expect(updatedHeading.lines[2].content).toHaveLength(1)
		})
		it('can change the third line of a three-line heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const first = '### Heading Text  '
			const second = 'second line  '
			const third = 'even a third line'
			const text = `${first}\n${second}\n${third}`
			let section = headingParser.parseLine(null, text, 0, first.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, `${first}\n`.length, second.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, `${first}\n${second}\n`.length, third.length) as MfMSection

			const updatedSection = updateParser.parse(section, { text: 'there\'s ', rangeOffset: `${first}\n${second}\n`.length, rangeLength: 0, }) as MfMSection

			expect(updatedSection).not.toBeNull()
			expect(updatedSection.lines).toHaveLength(3)
			expect(updatedSection.lines[2]).toHaveProperty('asText', 'there\'s even a third line')
			expect(updatedSection.lines[2]).toHaveProperty('start', `${first}\n${second}\n`.length)
			expect(updatedSection.lines[2]).toHaveProperty('length', 'there\'s even a third line'.length)
			expect(updatedSection.lines[0]).toHaveProperty('asText', '### Heading Text  ')
			expect(updatedSection.lines[1]).toHaveProperty('asText', 'second line  ')

			const updatedHeading = updatedSection?.content[0] as MfMHeading
			expect(updatedHeading).not.toBeNull()
			expect(updatedHeading.lines).toHaveLength(3)
			expect(updatedSection.lines[0].content).toHaveLength(1)
			expect(updatedSection.lines[0].content[0]).toEqual(updatedHeading.lines[0])
			expect(updatedHeading.lines[0].content).toHaveLength(4)

			expect(updatedSection.lines[1].content).toHaveLength(1)
			expect(updatedSection.lines[1].content[0]).toEqual(updatedHeading.lines[1])
			expect(updatedHeading.lines[1].content).toHaveLength(2)

			expect(updatedSection.lines[2].content).toHaveLength(1)
			expect(updatedSection.lines[2].content[0]).toEqual(updatedHeading.lines[2])
			expect(updatedHeading.lines[2].content).toHaveLength(1)
		})

		it('parses an update in an options block of a heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const text = `#{ the default value;\nkey2 = value2 } Heading Text  \nsecond line`
			let section = headingParser.parseLine(null, text, 0, '#{ the default value;'.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, '#{ the default value;\n'.length, 'key2 = value2 } Heading Text  '.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, '#{ the default value;\nkey2 = value2 } Heading Text  \n'.length, 'second line'.length) as MfMSection

			const updatedSection = updateParser.parse(section, { text: 'the ', rangeOffset: '#{ the default value;\nkey2 = '.length, rangeLength: 0, }) as MfMSection

			const heading = updatedSection.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.get('default')).toEqual('the default value')
			expect(heading.options.get('key2')).toEqual('the value2')

			expect(heading.content).toHaveLength(2)

			const headingLine1 = heading.content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = heading.content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')
		})
		it('parses an update after an options block of a heading', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const text = `#{ the default value;\nkey2 = value2 } Heading Text  \nsecond line`
			let section = headingParser.parseLine(null, text, 0, '#{ the default value;'.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, '#{ the default value;\n'.length, 'key2 = value2 } Heading Text  '.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, '#{ the default value;\nkey2 = value2 } Heading Text  \n'.length, 'second line'.length) as MfMSection

			const updatedSection = updateParser.parse(section, { text: 'the ', rangeOffset: '#{ the default value;\nkey2 = value2 } Heading Text  \n'.length, rangeLength: 0, }) as MfMSection

			const heading = updatedSection.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.get('default')).toEqual('the default value')
			expect(heading.options.get('key2')).toEqual('value2')

			expect(heading.content).toHaveLength(2)

			const headingLine1 = heading.content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = heading.content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'the second line')
		})
		it('rejects update to heading if there is an un-closed options block', () => {
			const { headingParser, } = createHeadingParser()
			const updateParser = new UpdateParser(new NumberedIdGenerator())

			const text = `#{ the default value;\nkey 2 value2 } Heading Text  \nsecond line`
			let section = headingParser.parseLine(null, text, 0, '#{ the default value;'.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, '#{ the default value;\n'.length, 'key 2 value2 } Heading Text  '.length) as MfMSection
			section = section.parsedWith.parseLine(section, text, '#{ the default value;\nkey 2 value2 } Heading Text  \n'.length, 'second line'.length) as MfMSection

			const heading = section.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.isFullyParsed).toEqual(false)

			const updatedSection = updateParser.parse(section, { text: 'a ', rangeOffset: `#{ the default value;\nkey 2 value2 } Heading Text  \n`.length, rangeLength: 0, }) as MfMSection

			expect(updatedSection).toBeNull()
		})
	})

	describe('Adding options', () => {
		it('adds options block at the beginning of the heading', () => {
			const { headingParser, } = createHeadingParser()

			const text = `#{ the default value; key2 = value2 } Heading Text  \nsecond line`
			let result = headingParser.parseLine(null, text, 0, '#{ the default value; key2 = value2 } Heading Text  '.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value; key2 = value2 } Heading Text  \n'.length, 'second line'.length) as MfMSection

			const heading = result.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.get('default')).toEqual('the default value')
			expect(heading.options.get('key2')).toEqual('value2')

			expect(heading.content).toHaveLength(2)

			const headingLine1 = heading.content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = heading.content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')
		})

		it('adds options block with two lines at the beginning of the heading', () => {
			const { headingParser, } = createHeadingParser()

			const text = `#{ the default value;\nkey2 = value2 } Heading Text  \nsecond line`
			let result = headingParser.parseLine(null, text, 0, '#{ the default value;'.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value;\n'.length, 'key2 = value2 } Heading Text  '.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value;\nkey2 = value2 } Heading Text  \n'.length, 'second line'.length) as MfMSection

			const heading = result.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.get('default')).toEqual('the default value')
			expect(heading.options.get('key2')).toEqual('value2')

			expect(heading.content).toHaveLength(2)

			const headingLine1 = heading.content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'Heading Text')

			const headingLine2 = heading.content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')
		})

		it('can parse heading that has only options in the second line', () => {
			const { headingParser, } = createHeadingParser()

			const text = `#{ the default value;\nkey2 = value2 }  \nsecond line`
			let result = headingParser.parseLine(null, text, 0, '#{ the default value;'.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value;\n'.length, 'key2 = value2 }  '.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value;\nkey2 = value2 }  \n'.length, 'second line'.length) as MfMSection

			const heading = result.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.get('default')).toEqual('the default value')
			expect(heading.options.get('key2')).toEqual('value2')

			expect(heading.content).toHaveLength(1)

			const headingLine1 = heading.content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'second line')
		})
		it('parses second heading line when options cannot be parsed anymore', () => {
			const { headingParser, } = createHeadingParser()

			const text = `#{ the default value;\nkey 2 value2 } Heading Text  \nsecond line`
			let result = headingParser.parseLine(null, text, 0, '#{ the default value;'.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value;\n'.length, 'key 2 value2 } Heading Text  '.length) as MfMSection
			result = headingParser.parseLine(result.content[0] as MfMHeading, text, '#{ the default value;\nkey 2 value2 } Heading Text  \n'.length, 'second line'.length) as MfMSection

			const heading = result.content[0] as MfMHeading

			expect(heading.options).not.toBeNull()
			expect(heading.options.get('default')).toEqual('the default value')
			expect(heading.options.get('key2')).toBeUndefined()

			expect(heading.content).toHaveLength(2)

			const headingLine1 = heading.content[0]
			expect(headingLine1).toHaveProperty('type', '--content-line--')
			expect(headingLine1.content).toHaveLength(1)
			expect(headingLine1.content[0]).toHaveProperty('text', 'key 2 value2 } Heading Text')

			const headingLine2 = heading.content[1]
			expect(headingLine2).toHaveProperty('type', '--content-line--')
			expect(headingLine2.content).toHaveLength(1)
			expect(headingLine2.content[0]).toHaveProperty('text', 'second line')
		})
	})
})
