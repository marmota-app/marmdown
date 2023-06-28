import { Element } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { MfMParagraph } from "$mfm/block/MfMParagraph"
import { MfMSection } from "$mfm/block/MfMSection"
import { MfMContentLine } from "$mfm/inline/MfMContentLine"
import { MfMEmphasis, MfMStrikeThrough } from "$mfm/inline/MfMEmphasis"
import { parseMarkdown } from "./parseMarkdown"
import type {MatcherFunction} from 'expect';

const assume = expect

describe('parseMarkdown', () => {
	it('always creates a resulting document', () => {
		const markdown = ''

		const result = parseMarkdown(markdown)

		expect(result).not.toBeNull()
	})

	it('empty markdown creates empty document', () => {
		const markdown = ''

		const result = parseMarkdown(markdown)

		expect(result.content).toHaveLength(0)
	})

	describe('parse headings', () => {
		const headlines: string[] = [ '#', '##', '###', '####', ]
		headlines.forEach((h: string) => {
			it(`heading level ${h.length} creates Headline`, () => {
				const markdown = h + ' Foobar\n'

				const result = parseMarkdown(markdown)

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'section')
				expect(result.content[0]).toHaveProperty('level', h.length)

				expect(result.content[0].content).toHaveLength(1)
				expect(result.content[0].content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0].content[0]).toHaveProperty('level', h.length)
				expect(result.content[0].content[0].content[0].content[0]).toHaveProperty('text', 'Foobar')
			})

			it(`creates empty heading fro single ${h}`, () => {
				const markdown = h

				const result = parseMarkdown(markdown)

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'section')
				expect(result.content[0]).toHaveProperty('level', h.length)

				expect(result.content[0].content).toHaveLength(1)
				expect(result.content[0].content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0].content[0]).toHaveProperty('level', h.length)
				expect(result.content[0].content[0].content).toHaveLength(0)
			})
		})

		const texts: string[] = [ 'Foobar\n', 'Foobar', 'Foo bar', 'Foo\r\n', 'foo # foobar', ]
		texts.forEach((text: string) => {
			it(`heading create Headling with text ${text}`, () => {
				const markdown = '# ' + text

				const result = parseMarkdown(markdown)

				const expectedText = text.replace('\n', '').replace('\r', '')

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'section')
				expect(result.content[0]).toHaveProperty('level', 1)

				expect(result.content[0].content).toHaveLength(1)
				expect(result.content[0].content[0]).toHaveProperty('type', 'heading')
				expect(result.content[0].content[0]).toHaveProperty('level', 1)
				expect(result.content[0].content[0].content[0].content[0]).toHaveProperty('text', expectedText)
			})
		})


		it('parses two headings into multiple heading', () => {
			const markdown = '# foo\n# bar'

			const result = parseMarkdown(markdown)
			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toHaveProperty('type', 'section')
			expect(result.content[0].content[0]).toHaveProperty('type', 'heading')
			expect(result.content[1]).toHaveProperty('type', 'section')
			expect(result.content[1].content[0]).toHaveProperty('type', 'heading')
		})

	})

	describe('parse paragraph', () => {
		it('create paragraph when line starts with normal text', () => {
			const markdown = 'lorem ipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'section')
			expect(result.content[0].content).toHaveLength(1)
			expect(result.content[0].content[0]).toHaveProperty('type', 'paragraph')
			expect((result.content[0].content[0] as MfMParagraph).content).toHaveLength(1)
			expect((result.content[0].content[0] as MfMParagraph).content[0].content[0]).toHaveProperty('type', 'text')
			expect((result.content[0].content[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem ipsum')
		})

		it('create paragraph when multiple line starts with normal text', () => {
			const markdown = 'lorem\nipsum'

			const result = parseMarkdown(markdown).content[0] as MfMSection

			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'paragraph')
			expect((result.content[0] as MfMParagraph).content).toHaveLength(2)
			expect((result.content[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')
			expect((result.content[0] as MfMParagraph).content[1].content[0]).toHaveProperty('text', 'ipsum')
		})

		it('create new paragraph for every empty line', () => {
			const markdown = 'lorem\n\nipsum'

			const result = parseMarkdown(markdown).content[0] as MfMSection

			expect(result.content).toHaveLength(3)
			expect(result.content[0]).toHaveProperty('type', 'paragraph')
			expect(result.content[1]).toHaveProperty('type', '--empty--')
			expect(result.content[2]).toHaveProperty('type', 'paragraph')
			expect((result.content[0] as MfMParagraph).content).toHaveLength(1)
			expect((result.content[2] as MfMParagraph).content).toHaveLength(1)
			expect((result.content[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')
			expect((result.content[2] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'ipsum')
		})

		it('create new paragraph for every empty line that contains only whitespaces', () => {
			const markdown = 'lorem\n    \t\nipsum'

			const result = parseMarkdown(markdown).content[0] as MfMSection

			expect(result.content).toHaveLength(3)
			expect(result.content[0]).toHaveProperty('type', 'paragraph')
			expect(result.content[1]).toHaveProperty('type', '--empty--')
			expect(result.content[2]).toHaveProperty('type', 'paragraph')
			expect((result.content[0] as MfMParagraph).content).toHaveLength(1)
			expect((result.content[2] as MfMParagraph).content).toHaveLength(1)
			expect((result.content[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')
			expect((result.content[2] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'ipsum')
		})
	})

	it.skip('parses a multiline code block that starts and ends with triple-backquote', () => {/*
		const markdown = '```\nlorem ipsum\ndolor sit amet\n```'

		const result = parseMarkdown(markdown)

		expect(result.content.filter(c => c.type === 'Preformatted')).to.have.length(1)
		expect(result.content[0]).to.have.property('type', 'Preformatted')

		const preformattedContent = (result.content[0] as Preformatted).content
		expect(preformattedContent).to.have.length(3)
		expect(preformattedContent[0]).to.have.property('content', 'lorem ipsum')
		expect(preformattedContent[1]).to.have.property('type', 'Newline')
		expect(preformattedContent[2]).to.have.property('content', 'dolor sit amet')
	*/})

	it.skip('parses github-style highlighted code blocks into the default option', () => {/*
		const markdown = '```javascript\nlorem ipsum\n```'

		const result = parseMarkdown(markdown)

		expect(result.content.filter(c => c.type === 'Preformatted')).to.have.length(1)
		expect(result.content[0]).to.have.property('type', 'Preformatted')

		const options = (result.content[0] as Preformatted).options
		expect(options).to.have.property('default', 'javascript')
	*/})

	describe('horizontal rule', () => {
		it.skip('parses --- as horizontal rule', () => {/*
			const markdown = '---\n'
	
			const result = parseMarkdown(markdown)
	
			expect(result.content.filter(c => c.type === 'HorizontalRule')).to.have.length(1)
			expect(result.content[0]).to.have.property('type', 'HorizontalRule')
		*/})
	})

	const blocks: string[][] = [ [ '^', 'aside', ], [ '>', 'block-quote', ], ]
	blocks.forEach(block => {
		describe('parse ' + block[1], () => {
			it(`adds an ${block[1]} when the line starts with a ${block[0]} character`, () => {
				const markdown = `${block[0]} lorem`

				const result = parseMarkdown(markdown).content[0] as MfMSection

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', block[1])
			})

			it(`adds a paragraph with the first line to the ${block[1]}`, () => {
				const markdown = `${block[0]} lorem`

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', block[1])

				const blockContent = (result.content[0] as GenericBlock<any, any, any, any>).content
				expect(blockContent).toHaveLength(1)
				expect(blockContent[0]).toHaveProperty('type', 'paragraph')
				expect((blockContent[0] as MfMParagraph).content).toHaveLength(1)
				expect((blockContent[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')
			})

			it(`adds more content to existing ${block[1]}`, () => {
				const markdown = `${block[0]} lorem\n${block[0]} ipsum`

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', block[1])

				const blockContent = (result.content[0] as GenericBlock<any, any, any, any>).content
				expect(blockContent).toHaveLength(1)
				expect(blockContent[0]).toHaveProperty('type', 'paragraph')
				expect((blockContent[0] as MfMParagraph).content).toHaveLength(2)
				expect((blockContent[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')
				expect((blockContent[0] as MfMParagraph).content[1].content[0]).toHaveProperty('text', 'ipsum')
			})

			it(`adds a second paragraph to existing ${block[1]}, even when there is no space after ${block[0]}`, () => {
				const markdown = `${block[0]} lorem\n${block[0]}\n${block[0]} ipsum`

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', block[1])

				const blockContent = (result.content[0] as GenericBlock<any, any, any, any>).content
				expect(blockContent).toHaveLength(3)
				expect(blockContent[0]).toHaveProperty('type', 'paragraph')
				expect(blockContent[2]).toHaveProperty('type', 'paragraph')
				expect((blockContent[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')
				expect((blockContent[2] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'ipsum')
			})

			it(`creates a second ${block[0]} when there is content in between`, () => {
				const markdown = `${block[0]} lorem\n\n${block[0]} ipsum`

				const result = parseMarkdown(markdown).content[0] as MfMSection

				expect(result.content).toHaveLength(3)

				const blockContent1 = (result.content[0] as GenericBlock<any, any, any, any>).content
				expect(blockContent1).toHaveLength(1)
				expect(blockContent1[0]).toHaveProperty('type', 'paragraph')
				expect((blockContent1[0] as MfMParagraph).content).toHaveLength(1)
				expect((blockContent1[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'lorem')

				const blockContent2 = (result.content[2] as GenericBlock<any, any, any, any>).content
				expect(blockContent2).toHaveLength(1)
				expect(blockContent2[0]).toHaveProperty('type', 'paragraph')
				expect((blockContent2[0] as MfMParagraph).content).toHaveLength(1)
				expect((blockContent2[0] as MfMParagraph).content[0].content[0]).toHaveProperty('text', 'ipsum')
			})
		})
	})

	describe('paragraph content: bold text', () => {
		const boldTags: string[] = [ '**', '__', ]
		boldTags.forEach(tag => {
			it(`parses ${tag} as bold text`, () => {
				const markdown = `text ${tag}bold text${tag} text`

				const result = parseMarkdown(markdown).content[0] as MfMSection
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'paragraph')

				const paragraphLine = (result.content[0] as MfMParagraph).content[0] as MfMContentLine

				expect(paragraphLine.content).toHaveLength(3)
				expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[0]).toHaveProperty('text', 'text ')

				expect(paragraphLine.content[1]).toHaveProperty('type', 'strong')
				expect(paragraphLine.content[1].content).toHaveLength(1)
				expect(paragraphLine.content[1].content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[1].content[0]).toHaveProperty('text', 'bold text')

				expect(paragraphLine.content[2]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[2]).toHaveProperty('text', ' text')
			})
		})

		const unclosedBoldStrings = [ ['**', 'not bold'], ['**', 'not bold__'], ]
		unclosedBoldStrings.forEach(([unclosed, notBold]) => {
			it(`does not render "${unclosed}${notBold}" as bold`, () => {
				const markdown = 'text before ' + unclosed + notBold

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'paragraph')

				const paragraphLine = (result.content[0].content[0] as MfMContentLine)
				expect(paragraphLine.content).toHaveLength(2)
				expect(paragraphLine.content[1]).toHaveProperty('type', '--text-span--')
				expect(paragraphLine.content[1].content).toHaveLength(2)
				expect(paragraphLine.content[1].content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[1].content[0]).toHaveProperty('text', unclosed)
				expect(paragraphLine.content[1].content[1]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[1].content[1]).toHaveProperty('text', notBold)
			})
		})

		it(`renders "**bold **" (with spaces) as not bold`, () => {
			//Incompatibility with old MfM parser (to be compatible with GfM
			//here): In legacy MfM, this was bold.
			const markdown = 'text before **bold **'

			const result = parseMarkdown(markdown).content[0] as MfMSection

			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'paragraph')

			const paragraphLine = (result.content[0].content[0] as MfMContentLine)
			expect(paragraphLine.content).toHaveLength(2)
			expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[0]).toHaveProperty('text', 'text before ')
			expect(paragraphLine.content[1]).toHaveProperty('type', '--text-span--')
			expect(paragraphLine.content[1].content).toHaveLength(2)
			expect(paragraphLine.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[1].content[0]).toHaveProperty('text', '**')
			expect(paragraphLine.content[1].content[1]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[1].content[1]).toHaveProperty('text', 'bold **')
		})

		const boldStringsWithSpaces = [ '** bold**', '** bold **', ]
		boldStringsWithSpaces.forEach(notBold => {
			it(`renders "${notBold}" (with spaces) as not bold`, () => {
				//Incompatibility with old MfM parser (to be compatible with GfM
				//here): In legacy MfM, this was bold.
				const markdown = 'text before ' + notBold

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'paragraph')

				const paragraphLine = (result.content[0].content[0] as MfMContentLine)
				expect(paragraphLine.content).toHaveLength(1)
				expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[0]).toHaveProperty('text', markdown)
			})
		})

		it('can parse a second bold block in the same line', () => {
			const result = parseMarkdown('**bold 1** other text **bold 2**').content[0] as MfMSection
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'paragraph')

			const paragraphLine = result.content[0].content[0] as MfMContentLine

			expect(paragraphLine.content).toHaveLength(3)
			expect(paragraphLine.content[0]).toHaveProperty('type', 'strong')
			expect(paragraphLine.content[0].content[0]).toHaveProperty('text', 'bold 1')

			expect(paragraphLine.content[1]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[1]).toHaveProperty('text', ' other text ')

			expect(paragraphLine.content[2]).toHaveProperty('type', 'strong')
			expect(paragraphLine.content[2].content[0]).toHaveProperty('text', 'bold 2')
		})
	})

	describe('paragraph content: italic text', () => {
		const italicTags: string[] = [ '*', '_', ]
		italicTags.forEach(tag => {
			it(`parses ${tag} as italic text`, () => {
				const markdown = `text ${tag}italic text${tag} text`

				const result = parseMarkdown(markdown).content[0] as MfMSection
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'paragraph')

				const paragraphLine = result.content[0].content[0] as MfMContentLine

				expect(paragraphLine.content).toHaveLength(3)
				expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[0]).toHaveProperty('text', 'text ')

				expect(paragraphLine.content[1]).toHaveProperty('type', 'emphasis')
				expect(paragraphLine.content[1].content[0]).toHaveProperty('text', 'italic text')

				expect(paragraphLine.content[2]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[2]).toHaveProperty('text', ' text')
			})
		})

		const unclosedItalicStrings = [ ['*', 'not italic'], ['*', 'not italic_'], ]
		unclosedItalicStrings.forEach(([unclosed, notItalic]) => {
			it(`does not render "${notItalic}" as italic`, () => {
				const markdown = 'text before ' + unclosed + notItalic

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'paragraph')

				const paragraphLine = (result.content[0].content[0] as MfMContentLine)
				expect(paragraphLine.content).toHaveLength(2)
				expect(paragraphLine.content[1]).toHaveProperty('type', '--text-span--')
				expect(paragraphLine.content[1].content).toHaveLength(2)
				expect(paragraphLine.content[1].content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[1].content[0]).toHaveProperty('text', unclosed)
				expect(paragraphLine.content[1].content[1]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[1].content[1]).toHaveProperty('text', notItalic)
			})
		})

		it(`renders "*italic *" (with spaces) as not emphazised`, () => {
			//Incompatibility with old MfM parser (to be compatible with GfM
			//here): In legacy MfM, this was emphazised.
			const markdown = 'text before *italic *'

			const result = parseMarkdown(markdown).content[0] as MfMSection

			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'paragraph')

			const paragraphLine = (result.content[0].content[0] as MfMContentLine)
			expect(paragraphLine.content).toHaveLength(2)
			expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[0]).toHaveProperty('text', 'text before ')
			expect(paragraphLine.content[1]).toHaveProperty('type', '--text-span--')
			expect(paragraphLine.content[1].content).toHaveLength(2)
			expect(paragraphLine.content[1].content[0]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[1].content[0]).toHaveProperty('text', '*')
			expect(paragraphLine.content[1].content[1]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[1].content[1]).toHaveProperty('text', 'italic *')
		})

		const boldStringsWithSpaces = [ '* italic*', '* italic *', ]
		boldStringsWithSpaces.forEach(notItalic => {
			it(`renders "${notItalic}" (with spaces) as not italic`, () => {
				//Incompatibility with old MfM parser (to be compatible with GfM
				//here): In legacy MfM, this was emphazised.
				const markdown = 'text before ' + notItalic

				const result = parseMarkdown(markdown).content[0] as MfMSection

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'paragraph')

				const paragraphLine = (result.content[0].content[0] as MfMContentLine)
				expect(paragraphLine.content).toHaveLength(1)
				expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
				expect(paragraphLine.content[0]).toHaveProperty('text', markdown)
			})
		})

		it('can parse a second italic block in the same line', () => {
			const result = parseMarkdown('*italic 1* other text *italic 2*').content[0] as MfMSection
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'paragraph')

			const paragraphLine = (result.content[0].content[0] as MfMContentLine)

			expect(paragraphLine.content).toHaveLength(3)
			expect(paragraphLine.content[0]).toHaveProperty('type', 'emphasis')
			expect(paragraphLine.content[0].content[0]).toHaveProperty('text', 'italic 1')

			expect(paragraphLine.content[1]).toHaveProperty('type', 'text')
			expect(paragraphLine.content[1]).toHaveProperty('text', ' other text ')

			expect(paragraphLine.content[2]).toHaveProperty('type', 'emphasis')
			expect(paragraphLine.content[2].content[0]).toHaveProperty('text', 'italic 2')
		})
	})

	it(`parses ~~ as strike-through text`, () => {
		const markdown = `text ~~strike-through text~~ text`

		const result = parseMarkdown(markdown).content[0] as MfMSection
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'paragraph')

		const paragraphLine = (result.content[0].content[0] as MfMContentLine)

		expect(paragraphLine.content).toHaveLength(3)
		expect(paragraphLine.content[0]).toHaveProperty('type', 'text')
		expect(paragraphLine.content[0]).toHaveProperty('text', 'text ')

		expect(paragraphLine.content[1]).toHaveProperty('type', 'strike-through')
		expect(paragraphLine.content[1].content[0]).toHaveProperty('text', 'strike-through text')

		expect(paragraphLine.content[2]).toHaveProperty('type', 'text')
		expect(paragraphLine.content[2]).toHaveProperty('text', ' text')
	})

	it('can mix strike-through, bold and italic', () => {
		const markdown = `~~text **bold**_**bold-italic**_~~`

		const result = parseMarkdown(markdown).content[0] as MfMSection
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'paragraph')

		const paragraphLine = (result.content[0].content[0] as MfMContentLine)

		expect(paragraphLine.content).toHaveLength(1)
		expect(paragraphLine.content[0]).toHaveProperty('type', 'strike-through')

		const strikeThroughContent = (paragraphLine.content[0] as MfMStrikeThrough).content
		expect(strikeThroughContent).toHaveLength(3)

		expect(strikeThroughContent[0]).toHaveProperty('type', 'text')
		expect(strikeThroughContent[0]).toHaveProperty('text', 'text ')

		expect(strikeThroughContent[1]).toHaveProperty('type', 'strong')
		expect(strikeThroughContent[1].content[0]).toHaveProperty('text', 'bold')

		expect(strikeThroughContent[2]).toHaveProperty('type', 'emphasis')
		expect((strikeThroughContent[2] as MfMEmphasis).content[0]).toHaveProperty('type', 'strong')
		expect((strikeThroughContent[2] as MfMEmphasis).content[0].content[0]).toHaveProperty('text', 'bold-italic')
	})

	it.skip('parses two spaces at the end of the line as NewLine', () => {/*
		const markdown = 'text  '

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(2)

		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text')

		expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'LineBreak')
	*/})

	describe('paragraph content: inline code', () => {
		const inlineCodeTags = [ '`', '``', '```', ]
		inlineCodeTags.forEach(tag => {
			it.skip(`parses ${tag} as inline code`, () => {/*
				const markdown = `text ${tag}code (preformatted)${tag} text`

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				expect((result.content[0] as Paragraph).content).to.have.length(3)
				expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
				expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

				expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'InlineCode')
				const inlineCode = (((result.content[0] as Paragraph).content[1] as InlineCodeTextContent))
				expect(inlineCode.content).to.have.length(1)
				expect(inlineCode.content[0]).to.have.property('type', 'Text')
				expect(inlineCode.content[0]).to.have.property('content', 'code (preformatted)')

				expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
				expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text')
			*/})
		})
		it.skip('parses inline code and bold correctly', () => {/*
			const markdown = 'text `code (preformatted)` text **bold text**'

			const result = parseMarkdown(markdown)
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).to.have.length(4)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'InlineCode')
			const inlineCode = (((result.content[0] as Paragraph).content[1] as InlineCodeTextContent))
			expect(inlineCode.content).to.have.length(1)
			expect(inlineCode.content[0]).to.have.property('type', 'Text')
			expect(inlineCode.content[0]).to.have.property('content', 'code (preformatted)')

			expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text ')

			expect((result.content[0] as Paragraph).content[3]).to.have.property('type', 'Bold')
			expect((result.content[0] as Paragraph).content[3]).to.have.textContent('bold text')
		*/})
		it.skip('parses bold and inline code correctly', () => {/*
			const markdown = 'text **bold text** text `code (preformatted)`'

			const result = parseMarkdown(markdown)
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).to.have.length(4)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Bold')
			expect((result.content[0] as Paragraph).content[1]).to.have.textContent('bold text')

			expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text ')

			expect((result.content[0] as Paragraph).content[3]).to.have.property('type', 'InlineCode')
			const inlineCode = (((result.content[0] as Paragraph).content[3] as InlineCodeTextContent))
			expect(inlineCode.content).to.have.length(1)
			expect(inlineCode.content[0]).to.have.property('type', 'Text')
			expect(inlineCode.content[0]).to.have.property('content', 'code (preformatted)')
		*/})
		it.skip('parses two inline code blocks with different start tags', () => {/*
			const markdown = 'text `code 1` text ``code 2``'

			const result = parseMarkdown(markdown)
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).to.have.length(4)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'InlineCode')
			const inlineCode1 = (((result.content[0] as Paragraph).content[1] as InlineCodeTextContent))
			expect(inlineCode1.content).to.have.length(1)
			expect(inlineCode1.content[0]).to.have.property('type', 'Text')
			expect(inlineCode1.content[0]).to.have.property('content', 'code 1')

			expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text ')

			expect((result.content[0] as Paragraph).content[3]).to.have.property('type', 'InlineCode')
			const inlineCode2 = (((result.content[0] as Paragraph).content[3] as InlineCodeTextContent))
			expect(inlineCode2.content).to.have.length(1)
			expect(inlineCode2.content[0]).to.have.property('type', 'Text')
			expect(inlineCode2.content[0]).to.have.property('content', 'code 2')
		*/})
	})

	describe('paragraph content: other', () => {
		it.skip('parses simple link', () => {/*
			const markdown = 'text [description](href) text'

			const result = parseMarkdown(markdown)
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).to.have.length(3)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'InlineLink')
			expect((result.content[0] as Paragraph).content[1]).to.have.property('description', 'description')
			expect((result.content[0] as Paragraph).content[1]).to.have.property('href', 'href')

			expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text')
		*/})
	})


	describe('document options', () => {
		it('parses options at the start of the document as document options', () => {
			const markdown = '{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options.get('foo')).toEqual('bar')
		})

		it('does not parse document options not at the start of the document', () => {
			const markdown = '\n{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options.isEmpty).toEqual(true)
			expect(result.options.get('foo')).toBeUndefined()
		})
		
		it('does not parse document options on a different element', () => {
			const markdown = '#{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options.isEmpty).toEqual(true)
			expect(result.options.get('foo')).toBeUndefined()
		})

		it('parses text after the document options as paragraph', () => {
			const markdown = '{ foo=bar }text'
			
			const result = parseMarkdown(markdown)
			
			assume(result.options.get('foo')).toEqual('bar')
			const paragraph = result.content[0].content[0] as MfMParagraph
			expect(paragraph.content[0].content[0]).toHaveProperty('type', 'text')
			expect(paragraph.content[0].content[0]).toHaveProperty('text', 'text')
		})
	})
})
