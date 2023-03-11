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

	it.skip('supports options on horizontal rule', () => {/*
		const markdown = '---{ defaultoption }\n'

		const result = parseMarkdown(markdown)

		const hruleResult = result.content.filter(c => c.type === 'HorizontalRule')
		expect(hruleResult).to.have.length(1)
		expect(hruleResult[0]).to.have.property('type', 'HorizontalRule')

		const options = (hruleResult[0] as HorizontalRule).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})

	it.skip('supports options on headings', () => {/*
		const markdown = '#{ defaultoption }\n'

		const result = parseMarkdown(markdown)

		const hResult = result.content.filter(c => c.type === 'Heading')
		expect(hResult).to.have.length(1)
		expect(hResult[0]).to.have.property('type', 'Heading')

		const options = (hResult[0] as Heading).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})

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
		it.skip(`supports options on ${style}`, () => {/*
			const markdown = `${style}{ defaultoption }text${style}`

			const result = parseMarkdown(markdown)
	
			assume(result.content).to.have.length(1)
			assume(result.content[0]).to.have.property('type', 'Paragraph')
			assume((result.content[0] as Paragraph).content[0]).to.have.property('options')
		
			const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
			expect(options).to.have.property('default', 'defaultoption')
		*/})
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

	it.skip('supports options on asides', () => {/*
		const markdown = '^{defaultoption} Aside content'

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Aside')
		assume(result.content[0]).to.have.property('options')
	
		const options = (result.content[0] as Block).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})
	it.skip('supports options on block quotes', () => {/*
		const markdown = '>{defaultoption} Block quote content'

		const result = parseMarkdown(markdown)
	
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Blockquote')
		assume(result.content[0]).to.have.property('options')
	
		const options = (result.content[0] as Block).options
		expect(options).to.have.property('default', 'defaultoption')
	*/})

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

	describe('slide options', () => {
		const slideStarts = [ '#', '---' ]

		slideStarts.forEach(slideStart => {
			it.skip(`slide "${slideStart}" adds optionsLine, optionsStart and optionsLength fields to existing options`, () => {/*
				const markdown = `\n\n${slideStart}{ foo=bar; }`
		
				const result = parseMarkdown(markdown)
				const options = (result.content[0] as any).options
		
				expect(options).to.have.property('optionsLine', '2')
				expect(options).to.have.property('optionsStart', ''+slideStart.length)
				expect(options).to.have.property('optionsLength', '12')
			*/})
		
			it.skip(`slide "${slideStart}" adds optionsLine, optionsStart and optionsLength fields when opetions are not explicitly defined`, () => {/*
				const markdown = `\n\n${slideStart}`
		
				const result = parseMarkdown(markdown)
				const options = (result.content[0] as any).options
		
				expect(options).to.have.property('optionsLine', '2')
				expect(options).to.have.property('optionsStart', ''+slideStart.length)
				expect(options).to.have.property('optionsLength', '0')
			*/})
		})
	})
})
