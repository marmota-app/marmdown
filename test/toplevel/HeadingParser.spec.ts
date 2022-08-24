import { HeadingParser } from "$markdown/toplevel/HeadingParser"

describe('HeadingParser', () => {
	const headingParser = new HeadingParser()

	const headingIdentifiers: string[] = [ '#', '##', '###', '####', ]
	headingIdentifiers.forEach((h: string) => {
		it(`heading level ${h.length} creates Headline`, () => {
			const markdown = h + ' Foobar\n'

			const result = headingParser.parse(markdown, 0, markdown.length)

			expect(result).not.toBeNull()
			expect(result?.content).toHaveProperty('type', 'Heading')
			expect(result?.content).toHaveProperty('level', h.length)
			expect(result?.content).toHaveProperty('text', 'Foobar')
			expect(result?.length).toEqual(markdown.length - '\n'.length)
		})

		it(`creates empty heading fro single ${h}`, () => {
			const markdown = h

			const result = headingParser.parse(markdown, 0, markdown.length)

			expect(result?.content).toHaveProperty('type', 'Heading')
			expect(result?.content).toHaveProperty('level', h.length)
			expect(result?.content).toHaveProperty('text', '')
			expect(result?.length).toEqual(markdown.length)
		})
	})

	it('parses heading options', () => {
		const markdown = '#{ foo = bar } Foobar\n'

		const result = headingParser.parse(markdown, 0, markdown.length)

		expect(result?.content.options).toHaveProperty('foo', 'bar')
	})

})
