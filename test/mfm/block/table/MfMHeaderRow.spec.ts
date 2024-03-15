import { parseMultiLine } from "../../../parseMultiLine"
import { createHeaderRowParser } from "./createTableParsers"

describe('MfMHeaderRow', () => {
	describe('parsing the content', () => {
		const validDelimiterRows: [string, string[]][] = [
			['Foo', [ 'Foo' ]],
			['| Foo |\tFoo Bar\t|    Baz|', [ 'Foo', 'Foo Bar', 'Baz' ]],
			['|Foo|\t   Foo  Bar \t |Baz    |', [ 'Foo', 'Foo  Bar', 'Baz' ]],
		]
		validDelimiterRows.forEach(r => it(`parses a valid header row "${r[0]}" as ${JSON.stringify(r[1])}`, () => {
			const parser = createHeaderRowParser()

			const [row, text] = parseMultiLine(parser, [
				r[0],
			])

			expect(row).not.toBeNull()
			expect(row?.columns).toHaveLength(r[1].length)
			row?.columns.forEach((c, i) => expect(c.content[0].content[0]).toHaveProperty('text', r[1][i]))
		}))
	})
	describe('parsing options', () => {})
	describe('parsing updates', () => {})
})
