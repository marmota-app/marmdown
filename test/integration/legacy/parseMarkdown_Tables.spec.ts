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

describe('parseMarkdown: Tables', () => {
	it.skip('parses empty table as table', () => {/*
		const markdown = '| abc | def |\n|-|- |'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).to.have.length(2)
		expect(table.headings[0].content[0]).to.have.property('type', 'Text')
		expect(table.headings[0].content[0]).to.have.property('content', 'abc')

		expect(table.headings[1].content[0]).to.have.property('type', 'Text')
		expect(table.headings[1].content[0]).to.have.property('content', 'def')
	*/})

	it.skip('parses table with two rows', () => {/*
		const markdown = '| abc | def |\n|-|- |\n|1,1| 1,2    |\n|2,1|2,2|'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.rows).to.have.length(2)
		expect(table.rows[0].columns[0].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[0].content[0]).to.have.property('content', '1,1')

		expect(table.rows[0].columns[1].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[1].content[0]).to.have.property('content', '1,2')

		expect(table.rows[1].columns[0].content[0]).to.have.property('type', 'Text')
		expect(table.rows[1].columns[0].content[0]).to.have.property('content', '2,1')

		expect(table.rows[1].columns[1].content[0]).to.have.property('type', 'Text')
		expect(table.rows[1].columns[1].content[0]).to.have.property('content', '2,2')
	*/})

	it.skip('parses table with no headers', () => {/*
		const markdown = '|-|- |\n|1,1| 1,2    |'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).to.have.length(0)

		expect(table.rows).to.have.length(1)
		expect(table.rows[0].columns[0].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[0].content[0]).to.have.property('content', '1,1')

		expect(table.rows[0].columns[1].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[1].content[0]).to.have.property('content', '1,2')
	*/})

	it.skip('parses table options after first row', () => {/*
		const markdown = '| abc | def |{chart;type=bars}\n|-|- |'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).to.have.length(2)
		expect(table.headings[1].content[0]).to.have.property('type', 'Text')
		expect(table.headings[1].content[0]).to.have.property('content', 'def')

		expect(table.options).to.have.property('default', 'chart')
		expect(table.options).to.have.property('type', 'bars')
	*/})

	it.skip('parses table with empty column', () => {/*
		const markdown = '|-|-|-|\n|1,1|   |1,3|'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).to.have.length(0)

		expect(table.rows).to.have.length(1)
		expect(table.rows[0].columns).to.have.length(3)
		expect(table.rows[0].columns[0].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[0].content[0]).to.have.property('content', '1,1')

		expect(table.rows[0].columns[1].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[1].content[0]).to.have.property('content', '')

		expect(table.rows[0].columns[2].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[2].content[0]).to.have.property('content', '1,3')
	*/})

	it.skip('parses table and keeps last column even without last pipe', () => {/*
		const markdown = '|-|-|-|\n|1,1|   |1,3'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).to.have.length(0)

		expect(table.rows).to.have.length(1)
		expect(table.rows[0].columns).to.have.length(3)
		expect(table.rows[0].columns[2].content[0]).to.have.property('type', 'Text')
		expect(table.rows[0].columns[2].content[0]).to.have.property('content', '1,3')
	*/})

	it.skip('parses paragraph content in table header', () => {/*
		const markdown = '| **abc** | def `ghi` |\n|-|- |\n|1,1| 1,2    |\n|2,1|2,2|'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		assume(table.headings).to.have.length(2)

		expect(table.headings[0].content).to.have.length(1)
		expect(table.headings[0].content[0]).to.have.property('type', 'Bold')
		expect(table.headings[0].content[0]).to.have.textContent('abc')

		expect(table.headings[1].content).to.have.length(2)
		expect(table.headings[1].content[0]).to.have.property('type', 'Text')
		expect(table.headings[1].content[0]).to.have.property('content', 'def ')

		expect(table.headings[1].content[1]).to.have.property('type', 'InlineCode')
	*/})

	it.skip('parses paragraph content in table content', () => {/*
		const markdown = '| abc | def |\n|-|- |\n|**1,1**| 1,2    |\n||2,2|'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		assume(table.rows).to.have.length(2)
		expect(table.rows[0].columns[0].content[0]).to.have.property('type', 'Bold')
		expect(table.rows[0].columns[0].content[0]).to.have.textContent('1,1')
	*/})

	it.skip('starts a new table after an empty line', () => {/*
		const markdown = '| abc | def |\n|-|-|\n\n| ghi | jkl |\n|-|-|'

		const result = parseMarkdown(markdown)

		expect(result.content).to.have.length(3)

		assume(result.content[0]).to.have.property('type', 'Table')

		expect(result.content[2]).to.have.property('type', 'Table')
		const table = result.content[2] as Table

		expect(table.headings[0].content[0]).to.have.property('type', 'Text')
		expect(table.headings[0].content[0]).to.have.property('content', 'ghi')

		expect(table.headings[1].content[0]).to.have.property('type', 'Text')
		expect(table.headings[1].content[0]).to.have.property('content', 'jkl')
	*/})

	it.skip('does not parse content as table when delimiters are missing', () => {/*
		const markdown = '| abc | def |\n| ghi | jkl |\n'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).to.have.property('type', 'Paragraph')
	*/})

	it.skip('creates number of columns from delimiter row in each row', () => {/*
		const markdown = '|foo|bar|baz\n|-|-|\n| abc |\n|def| ghi | jkl |\n'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.rows[0].columns).to.have.length(2)
		expect(table.rows[1].columns).to.have.length(2)
		expect(table.headings).to.have.length(2)
	*/})

	it.skip('parses delimiters with correct alignment', () => {/*
		const markdown = '|-|:-|:-:|-:|\n| abc |\n'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).to.have.property('type', 'Table')
		const table = result.content[0] as Table

		expect(table.columns).to.have.length(4)
		expect(table.columns?.[0]).to.have.property('align', 'left')
		expect(table.columns?.[1]).to.have.property('align', 'left')
		expect(table.columns?.[2]).to.have.property('align', 'center')
		expect(table.columns?.[3]).to.have.property('align', 'right')
	*/})
})
