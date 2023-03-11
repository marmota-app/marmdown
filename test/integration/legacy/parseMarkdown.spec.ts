describe('parseMarkdown', () => {
	it.skip('always creates a resulting document', () => {/*
		const markdown = ''

		const result = parseMarkdown(markdown)

		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		expect(result).to.exist
	*/})

	it.skip('empty markdown creates empty document', () => {/*
		const markdown = ''

		const result = parseMarkdown(markdown)

		expect(result.content).to.deep.equal([])
	*/})

	describe('parse headings', () => {
		const headlines: string[] = [ '#', '##', '###', '####', ]
		headlines.forEach((h: string) => {
			it.skip(`heading level ${h.length} creates Headline`, () => {/*
				const markdown = h + ' Foobar\n'

				const result = parseMarkdown(markdown)

				expect(result.content).to.have.length(1)
				expect(result.content[0]).to.have.property('type', 'Heading')
				expect(result.content[0]).to.have.property('level', h.length)
				expect(result.content[0]).to.have.property('text', 'Foobar')
			*/})

			it.skip(`creates empty heading fro single ${h}`, () => {/*
				const markdown = h

				const result = parseMarkdown(markdown)

				expect(result.content).to.have.length(1)
				expect(result.content[0]).to.have.property('type', 'Heading')
				expect(result.content[0]).to.have.property('level', h.length)
				expect(result.content[0]).to.have.property('text', '')
			*/})
		})

		const texts: string[] = [ 'Foobar\n', 'Foobar', 'Foo bar', 'Foo\r\n', 'Foo\n\r', 'foo # foobar', ]
		texts.forEach((text: string) => {
			it.skip(`heading create Headling with text ${text}`, () => {/*
				const markdown = '# ' + text

				const result = parseMarkdown(markdown)

				const expectedText = text.replace('\n', '').replace('\r', '')

				expect(result.content).to.have.length(1)
				expect(result.content[0]).to.have.property('type', 'Heading')
				expect(result.content[0]).to.have.property('text', expectedText)
			*/})
		})


		it.skip('parses two headings into multiple heading', () => {/*
			const markdown = '# foo\n# bar'

			const result = parseMarkdown(markdown)
			expect(result.content).to.have.length(2)
			expect(result.content[0]).to.have.property('type', 'Heading')
			expect(result.content[1]).to.have.property('type', 'Heading')
		*/})

	})

	describe('parse paragraph', () => {
		it.skip('create paragraph when line starts with normal text', () => {/*
			const markdown = 'lorem ipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).to.have.length(1)
			expect(result.content[0]).to.have.property('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).to.have.length(1)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'lorem ipsum')
		*/})

		it.skip('create paragraph when multiple line starts with normal text', () => {/*
			const markdown = 'lorem\nipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).to.have.length(1)
			expect(result.content[0]).to.have.property('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).to.have.length(3)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'lorem')
			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Newline')
			expect((result.content[0] as Paragraph).content[2]).to.have.property('content', 'ipsum')
		*/})

		it.skip('create new paragraph for every empty line', () => {/*
			const markdown = 'lorem\n\nipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).to.have.length(2)
			expect(result.content[0]).to.have.property('type', 'Paragraph')
			expect(result.content[1]).to.have.property('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).to.have.length(1)
			expect((result.content[1] as Paragraph).content).to.have.length(1)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'lorem')
			expect((result.content[1] as Paragraph).content[0]).to.have.property('content', 'ipsum')
		*/})

		it.skip('create new paragraph for every empty line that contains only whitespaces', () => {/*
			const markdown = 'lorem\n    \t\nipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).to.have.length(2)
			expect(result.content[0]).to.have.property('type', 'Paragraph')
			expect(result.content[1]).to.have.property('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).to.have.length(1)
			expect((result.content[1] as Paragraph).content).to.have.length(1)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'lorem')
			expect((result.content[1] as Paragraph).content[0]).to.have.property('content', 'ipsum')
		*/})
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

	const blocks: string[][] = [ [ '^', 'Aside', ], [ '>', 'Blockquote', ], ]
	blocks.forEach(block => {
		describe('parse ' + block[1], () => {
			it.skip(`adds an ${block[1]} when the line starts with a ${block[0]} character`, () => {/*
				const markdown = `${block[0]} lorem`

				const result = parseMarkdown(markdown)

				expect(result.content).to.have.length(1)
				expect(result.content[0]).to.have.property('type', block[1])
			*/})

			it.skip(`adds a paragraph with the first line to the ${block[1]}`, () => {/*
				const markdown = `${block[0]} lorem`

				const result = parseMarkdown(markdown)

				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', block[1])

				const blockContent = (result.content[0] as Block).content
				expect(blockContent).to.have.length(1)
				expect(blockContent[0]).to.have.property('type', 'Paragraph')
				expect((blockContent[0] as Paragraph).content).to.have.length(1)
				expect((blockContent[0] as Paragraph).content[0]).to.have.property('content', 'lorem')
			*/})

			it.skip(`adds more content to existing ${block[1]}`, () => {/*
				const markdown = `${block[0]} lorem\n${block[0]} ipsum`

				const result = parseMarkdown(markdown)

				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', block[1])

				const blockContent = (result.content[0] as Block).content
				expect(blockContent).to.have.length(1)
				expect(blockContent[0]).to.have.property('type', 'Paragraph')
				expect((blockContent[0] as Paragraph).content).to.have.length(3)
				expect((blockContent[0] as Paragraph).content[0]).to.have.property('content', 'lorem')
				expect((blockContent[0] as Paragraph).content[1]).to.have.property('type', 'Newline')
				expect((blockContent[0] as Paragraph).content[2]).to.have.property('content', 'ipsum')
			*/})

			it.skip(`adds a second paragraph to existing ${block[1]}, even when there is no space after ${block[0]}`, () => {/*
				const markdown = `${block[0]} lorem\n${block[0]}\n${block[0]} ipsum`

				const result = parseMarkdown(markdown)

				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', block[1])

				const blockContent = (result.content[0] as Block).content
				expect(blockContent).to.have.length(2)
				expect(blockContent[0]).to.have.property('type', 'Paragraph')
				expect(blockContent[1]).to.have.property('type', 'Paragraph')
				expect((blockContent[0] as Paragraph).content[0]).to.have.property('content', 'lorem')
				expect((blockContent[1] as Paragraph).content[0]).to.have.property('content', 'ipsum')
			*/})

			it.skip(`creates a second ${block[0]} when there is content in between`, () => {/*
				const markdown = `${block[0]} lorem\n\n${block[0]} ipsum`

				const result = parseMarkdown(markdown)

				const blocks = result.content.filter(c => c.type === block[1])
				expect(blocks).to.have.length(2)

				const blockContent1 = (blocks[0] as Block).content
				expect(blockContent1).to.have.length(1)
				expect(blockContent1[0]).to.have.property('type', 'Paragraph')
				expect((blockContent1[0] as Paragraph).content).to.have.length(1)
				expect((blockContent1[0] as Paragraph).content[0]).to.have.property('content', 'lorem')

				const blockContent2 = (blocks[1] as Block).content
				expect(blockContent2).to.have.length(1)
				expect(blockContent2[0]).to.have.property('type', 'Paragraph')
				expect((blockContent2[0] as Paragraph).content).to.have.length(1)
				expect((blockContent2[0] as Paragraph).content[0]).to.have.property('content', 'ipsum')
		*/})
		})
	})

	describe('paragraph content: bold text', () => {
		const boldTags: string[] = [ '**', '__', ]
		boldTags.forEach(tag => {
			it.skip(`parses ${tag} as bold text`, () => {/*
				const markdown = `text ${tag}bold text${tag} text`

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				expect((result.content[0] as Paragraph).content).to.have.length(3)
				expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
				expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

				expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Bold')
				expect((result.content[0] as Paragraph).content[1]).to.have.textContent('bold text')

				expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
				expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text')
			*/})
		})

		const unclosedBoldStrings = [ '**not bold', '**not bold__', ]
		unclosedBoldStrings.forEach(notBold => {
			it.skip(`does not render "${notBold}" as bold`, () => {/*
				const markdown = 'text before ' + notBold

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				paragraph.content.forEach(c => expect(c).to.have.property('type', 'Text'))
				const textContent = paragraph.content.map(c => (c as TextContent)['content']).join('')
				expect(textContent).to.equal(markdown)
			*/})
		})

		const boldStringsWithSpaces = [ '**bold **', '** bold**', '** bold **', ]
		boldStringsWithSpaces.forEach(bold => {
			it.skip(`renders "${bold}" (with spaces) as bold`, () => {/*
				const markdown = 'text before ' + bold

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				expect(paragraph.content).to.have.length(2)
				expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Bold')
				expect((result.content[0] as Paragraph).content[1]).to.have.textContent(bold.replace(/\*\*--remove me (was there for comment to work)--/g, ''))
			*/})
		})

		it.skip('can parse a second bold block in the same line', () => {/*
			const result = parseMarkdown('**bold 1** other text **bold 2**')
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).to.have.length(3)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Bold')
			expect((result.content[0] as Paragraph).content[0]).to.have.textContent('bold 1')

			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[1]).to.have.property('content', ' other text ')

			expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Bold')
			expect((result.content[0] as Paragraph).content[2]).to.have.textContent('bold 2')
		*/})
	})

	describe('paragraph content: italic text', () => {
		const italicTags: string[] = [ '*', '_', ]
		italicTags.forEach(tag => {
			it.skip(`parses ${tag} as italic text`, () => {/*
				const markdown = `text ${tag}italic text${tag} text`

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				expect((result.content[0] as Paragraph).content).to.have.length(3)
				expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
				expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

				expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Italic')
				expect((result.content[0] as Paragraph).content[1]).to.have.textContent('italic text')

				expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
				expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text')
			*/})
		})

		const unclosedItalicStrings = [ '*not italic', '*not italic_', ]
		unclosedItalicStrings.forEach(notItalic => {
			it.skip(`does not render "${notItalic}" as italic`, () => {/*
				const markdown = 'text before ' + notItalic

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				paragraph.content.forEach(c => expect(c).to.have.property('type', 'Text'))
				const textContent = paragraph.content.map(c => (c as TextContent)['content']).join('')
				expect(textContent).to.equal(markdown)
			*/})
		})

		const italicStringsWithSpaces = [ '*italic *', '* italic*', '* italic *', ]
		italicStringsWithSpaces.forEach(italic => {
			it.skip(`renders "${italic}" (with spaces) as italic`, () => {/*
				const markdown = 'text before ' + italic

				const result = parseMarkdown(markdown)
				assume(result.content).to.have.length(1)
				assume(result.content[0]).to.have.property('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				expect(paragraph.content).to.have.length(2)
				expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Italic')
				expect((result.content[0] as Paragraph).content[1]).to.have.textContent(italic.replace(/\*--remove me (was there for comment to work)--/g, ''))
			*/})
		})

		it.skip('can parse a second italic block in the same line', () => {/*
			const result = parseMarkdown('*italic 1* other text *italic 2*')
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).to.have.length(3)
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Italic')
			expect((result.content[0] as Paragraph).content[0]).to.have.textContent('italic 1')

			expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[1]).to.have.property('content', ' other text ')

			expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Italic')
			expect((result.content[0] as Paragraph).content[2]).to.have.textContent('italic 2')
		*/})
	})

	it.skip(`parses ~~ as strike-through text`, () => {/*
		const markdown = `text ~~strike-through text~~ text`

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(3)
		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'StrikeThrough')
		expect((result.content[0] as Paragraph).content[1]).to.have.textContent('strike-through text')

		expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text')
	*/})

	it.skip('can mix strike-through, bold and italic', () => {/*
		const markdown = `~~text **bold**_**bold-italic**_~~`

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(1)
		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'StrikeThrough')

		const strikeThroughContent = ((result.content[0] as Paragraph).content[0] as StrikeThroughTextContent).content
		expect(strikeThroughContent).to.have.length(3)

		expect(strikeThroughContent[0]).to.have.property('type', 'Text')
		expect(strikeThroughContent[0]).to.have.property('content', 'text ')

		expect(strikeThroughContent[1]).to.have.property('type', 'Bold')
		expect(strikeThroughContent[1]).to.have.textContent('bold')

		expect(strikeThroughContent[2]).to.have.property('type', 'Italic')
		expect((strikeThroughContent[2] as ItalicTextContent).content[0]).to.have.property('type', 'Bold')
		expect((strikeThroughContent[2] as ItalicTextContent).content[0]).to.have.textContent('bold-italic')
	*/})

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
		it.skip('parses options at the start of the document as document options', () => {/*
			const markdown = '{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options).to.have.property('foo', 'bar')
		*/})

		it.skip('does not parse document options not at the start of the document', () => {/*
			const markdown = '\n{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options).to.not.have.property('foo', 'bar')
		*/})
		
		it.skip('does not parse document options on a different element', () => {/*
			const markdown = '#{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options).to.not.have.property('foo', 'bar')
		*/})

		it.skip('parses text after the document options as paragraph', () => {/*
			const markdown = '{ foo=bar }text'
			
			const result = parseMarkdown(markdown)
			
			assume(result.options).to.have.property('foo', 'bar')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text')
		*/})
	})
})
