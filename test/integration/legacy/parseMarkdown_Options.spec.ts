import { MfMGeneralPurposeBlock } from "$mfm/block/MfMGeneralPurposeBlock"
import { MfMHeading } from "$mfm/block/MfMHeading"
import { MfMParagraph } from "$mfm/block/MfMParagraph"
import { MfMSection } from "$mfm/block/MfMSection"
import { MfMThematicBreak } from "$mfm/block/MfMThematicBreak"
import { MfMContentLine } from "$mfm/inline/MfMContentLine"
import { parseMarkdown } from "./parseMarkdown"

describe('parseMarkdown: Options with curly braces', () => {
	it.skip('supports options on code blocks', () => {/*
		const markdown = '```{ javascript }\n```'

		const result = parseMarkdown(markdown)

		expect(result.content.filter(c => c.type === 'Preformatted')).to.have.length(1)
		expect(result.content[0]).to.have.property('type', 'Preformatted')

		const options = (result.content[0] as Preformatted).options
		expect(options).to.have.property('default', 'javascript')
	*/})

	it.skip('supports options block on paragraph inline code block', () => {/*
		const markdown = '`{ javascript }inner text`'

		const result = parseMarkdown(markdown)

		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('type', 'InlineCode')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options
		expect(options).to.have.property('default', 'javascript')
		expect(inlineCode.content).to.have.length(1)
		expect(inlineCode.content[0]).to.have.property('type', 'Text')
		expect(inlineCode.content[0]).to.have.property('content', 'inner text')
	*/})

	it('supports options on horizontal rule', () => {
		const markdown = '---{ defaultoption }\n'

		const result = parseMarkdown(markdown).content[0] as MfMSection

		const hrule = result.content[0] as MfMThematicBreak
		expect(hrule).toHaveProperty('type', 'thematic-break')

		const options = hrule.options
		expect(options.get('default')).toEqual('defaultoption')
	})

	it('supports options on headings', () => {
		const markdown = '#{ defaultoption }\n'

		const result = parseMarkdown(markdown).content[0] as MfMSection

		const hResult = result.content[0]
		expect(hResult).toHaveProperty('type', 'heading')

		const options = (hResult as MfMHeading).options
		expect(options.get('default')).toEqual('defaultoption')
	})

	it.skip('supports options on paragraphs', () => {/*
		const markdown = 'asdf\n\n{ defaultoption }paragraph 2\n'

		const result = parseMarkdown(markdown)

		const pResult = result.content.filter(c => c.type === 'Paragraph')
		expect(pResult).to.have.length.greaterThanOrEqual(2)
		expect(pResult.at(1)).to.have.property('type', 'Paragraph')

		const options = (pResult.at(1) as Paragraph).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})

	const styles: string[] = ['_', '**', '~~']
	styles.forEach(style => {
		it(`supports options on ${style}`, () => {
			const markdown = `${style}{ defaultoption }text${style}`

			const result = parseMarkdown(markdown).content[0] as MfMSection
	
			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'paragraph')

			const line = (result.content[0] as MfMParagraph).content[0] as MfMContentLine
			expect(line.content[0]).toHaveProperty('options')
		
			const options = (line.content[0] as any).options
			expect(options.get('default')).toEqual('defaultoption')
		})
	})

	it.skip('supports options on links', () => {/*
		const markdown = '[text](target){defaultoption}'

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('options')
	
		const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})

	it.skip('supports options on image links', () => {/*
		const markdown = '![text](target){defaultoption}'

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('options')
	
		const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})

	const lowercaseLinks = [
		'https://youtu.be/x_0EH-mLyRM', 'https://vimeo.com/123123123', 'https://www.youtube.com/watch?v=x_0EH-mLyRM&feature=youtu.be',
		'./file.mp4', './file.mov', './file.avi','./file.wmv', './file.webm',
	]
	const uppercaseLinks = lowercaseLinks.map(l => l.toUpperCase())
	const videoLinks = [ ...lowercaseLinks, ...uppercaseLinks, ]
	videoLinks.forEach(link => it.skip(`has "video" type option when link is ${link}`, () => {/*
		const markdown = `![text](${link})`

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('options')
	
		const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
		expect(options).to.have.property('type', 'video')
	*/}))

	it('supports options on asides', () => {
		const markdown = '^{defaultoption} Aside content'

		const result = parseMarkdown(markdown).content[0] as MfMSection
	
		expect(result.content).toHaveLength(1)
		expect(result.content[0]).toHaveProperty('type', 'aside')
		expect(result.content[0]).toHaveProperty('options')
	
		const options = (result.content[0] as any).options
		expect(options.get('default')).toEqual('defaultoption')
	})
	it('supports options on block quotes', () => {
		const markdown = '>{defaultoption} Block quote content'

		const result = parseMarkdown(markdown).content[0] as MfMSection
	
		expect(result.content).toHaveLength(1)
		expect(result.content[0]).toHaveProperty('type', 'block-quote')
		expect(result.content[0]).toHaveProperty('options')
	
		const options = (result.content[0] as MfMGeneralPurposeBlock).options
		expect(options.get('default')).toEqual('defaultoption')
	})

	it.skip('supports options on lists (first item)', () => {/*
		const markdown = '*{defaultoption} item 1\n* item2'

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'UnorderedList')
		assume(result.content[0]).to.have.property('options')
	
		const options = (result.content[0] as Block).options
		expect(options).to.have.property('default', 'defaultoption')

		assume((result.content[0] as List).items).to.have.length(2)
		assume((result.content[0] as List).items[0]).to.have.property('type', 'ListItem')
		assume((result.content[0] as List).items[0]).to.have.property('options')
	
		const itemOptions = ((result.content[0] as List).items[0] as ListItem).options
		expect(itemOptions).to.have.property('default', 'defaultoption')
	*/})
	it.skip('supports options on lists (subsequent item)', () => {/*
		const markdown = '* item 1\n*{defaultoption} item2'

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'UnorderedList')
		assume(result.content[0]).to.have.property('options')
	
		const options = (result.content[0] as Block).options
		expect(options).to.not.have.property('default')

		const list = (result.content[0] as List)
		assume(list.items).to.have.length(2)
		assume(list.items[1]).to.have.property('type', 'ListItem')
		assume(list.items[1]).to.have.property('options')
	
		const itemOptions = ((result.content[0] as List).items[1] as ListItem).options
		expect(itemOptions).to.have.property('default', 'defaultoption')
	*/})

	it.skip('does not parse incomplete option block', () => {/*
		const markdown = '`{ javascript`'

		const result = parseMarkdown(markdown)

		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('type', 'InlineCode')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		expect(options).to.be.empty
		expect(inlineCode.content).to.have.length(1)
		expect(inlineCode.content[0]).to.have.property('type', 'Text')
		expect(inlineCode.content[0]).to.have.property('content', '{ javascript')
	*/})

	it.skip('parses named option instead of default', () => {/*
		const markdown = '`{ foo = bar }inner text`'

		const result = parseMarkdown(markdown)

		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('type', 'InlineCode')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options
		expect(options).to.not.have.property('default')
		expect(options).to.have.property('foo', 'bar')
		expect(inlineCode.content).to.have.length(1)
		expect(inlineCode.content[0]).to.have.property('type', 'Text')
		expect(inlineCode.content[0]).to.have.property('content', 'inner text')
	*/})

	it.skip('parses default option and key/value options', () => {/*
		const markdown = '`{ def; foo = bar; baz=another option }inner text`'

		const result = parseMarkdown(markdown)

		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('type', 'InlineCode')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options
		expect(options).to.have.property('default', 'def')
		expect(options).to.have.property('foo', 'bar')
		expect(options).to.have.property('baz', 'another option')
		expect(inlineCode.content).to.have.length(1)
		expect(inlineCode.content[0]).to.have.property('type', 'Text')
		expect(inlineCode.content[0]).to.have.property('content', 'inner text')
	*/})

	it.skip('does not parse default option after first entry', () => {/*
		const markdown = '`{ foo=bar; def }code content`'

		const result = parseMarkdown(markdown)

		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).to.have.property('type', 'InlineCode')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		expect(options).to.not.have.property('default')
		expect(options).to.not.have.property('def')
		expect(options).to.have.property('foo', 'bar')
		expect(inlineCode.content).to.have.length(1)
		expect(inlineCode.content[0]).to.have.property('type', 'Text')
		expect(inlineCode.content[0]).to.have.property('content', 'code content')
	*/})
})
