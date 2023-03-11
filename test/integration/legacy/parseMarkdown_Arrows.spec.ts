describe('parseMarkdown: Arrows', () => {
	it.skip('parses arrow', () => {/*
		const markdown = 'text =>{}pointed text'

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(3)
		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).to.have.property('pointingTo', 'pointed')

		expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[2]).to.have.property('content', ' text')
	*/})

	it.skip('parses arrow with text at end of line', () => {/*
		const markdown = 'text =>{}pointed'

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(2)
		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).to.have.property('pointingTo', 'pointed')
	*/})

	it.skip('parses arrow at end of line', () => {/*
		const markdown = 'text =>{}'

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(2)
		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).to.have.property('pointingTo', '')
	*/})

	it.skip('parses two arrows in same word', () => {/*
		const markdown = 'text =>{}poin=>{up-left}ted text'

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(4)
		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).to.have.property('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).to.have.property('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).to.have.property('pointingTo', 'poin')

		expect((result.content[0] as Paragraph).content[2]).to.have.property('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[2]).to.have.property('pointingTo', 'ted')

		expect((result.content[0] as Paragraph).content[3]).to.have.property('type', 'Text')
		expect((result.content[0] as Paragraph).content[3]).to.have.property('content', ' text')
	*/})

	it.skip('parses arrows in inline code', () => {/*
		const markdown = '`code =>{}with arrow`'

		const result = parseMarkdown(markdown)
		assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).to.have.length(1)

		expect((result.content[0] as Paragraph).content[0]).to.have.property('type', 'InlineCode')
		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		expect(inlineCode.content).to.have.length(3)
		expect(inlineCode.content[0]).to.have.property('type', 'Text')
		expect(inlineCode.content[0]).to.have.property('content', 'code ')

		expect(inlineCode.content[1]).to.have.property('type', 'Arrow')
		expect(inlineCode.content[1]).to.have.property('pointingTo', 'with')

		expect(inlineCode.content[2]).to.have.property('type', 'Text')
		expect(inlineCode.content[2]).to.have.property('content', ' arrow')
	*/})
	it.skip('parses arrows in code block', () => {/*
		const markdown = '```\ncode =>{}with arrow\nmore code\nanother =>{}arrow\n```'

		const result = parseMarkdown(markdown)
		//assume(result.content).to.have.length(1)
		assume(result.content[0]).to.have.property('type', 'Preformatted')

		const codeBlock = (result.content[0] as Preformatted)
		expect(codeBlock.content).to.have.length(8)
		expect(codeBlock.content[0]).to.have.property('type', 'Text')
		expect(codeBlock.content[0]).to.have.property('content', 'code ')

		expect(codeBlock.content[1]).to.have.property('type', 'Arrow')
		expect(codeBlock.content[1]).to.have.property('pointingTo', 'with')

		expect(codeBlock.content[2]).to.have.property('type', 'Text')
		expect(codeBlock.content[2]).to.have.property('content', ' arrow')

		expect(codeBlock.content[3]).to.have.property('type', 'Newline')

		expect(codeBlock.content[4]).to.have.property('type', 'Text')
		expect(codeBlock.content[4]).to.have.property('content', 'more code')

		expect(codeBlock.content[5]).to.have.property('type', 'Newline')

		expect(codeBlock.content[6]).to.have.property('type', 'Text')
		expect(codeBlock.content[6]).to.have.property('content', 'another ')

		expect(codeBlock.content[7]).to.have.property('type', 'Arrow')
		expect(codeBlock.content[7]).to.have.property('pointingTo', 'arrow')
	*/})
})