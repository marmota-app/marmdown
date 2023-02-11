import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "./html"
import { sanitized } from "./sanitize"

describe('MfM: Parsing updates', () => {
	describe('updates that preserve the document structure', () => {
		test('update text in heading', () => {
			const md = new Marmdown(new MfMDialect())
	
			md.textContent = sanitized`# The heading content.`
			md.update({ rangeOffset: 6, rangeLength: 0, text: 'updated ' }, () => 'dummy')
	
			expect(html(md)).toEqual(sanitized`
				<h1>The updated heading content.</h1>`)
		})
	
		test('update text in single-line paragraph', () => {
			const md = new Marmdown(new MfMDialect())
	
			md.textContent = sanitized`The text content.`
			md.update({ rangeOffset: 4, rangeLength: 0, text: 'updated ' }, () => 'dummy')
	
			expect(html(md)).toEqual(sanitized`
				<p>The updated text content.</p>`)
		})

		test('updates the text inside a block with two paragraphs', () => {
			const md = new Marmdown(new MfMDialect())
	
			md.textContent = sanitized`
				> the first paragraph
				> has two lines
				>
				> the original second paragraph`
			md.update({ rangeOffset: 46, rangeLength: 9, text: 'updated ' }, () => 'dummy')
	
			expect(html(md)).toEqual(sanitized`
				<blockquote>
				<p>the first paragraph
				has two lines</p>
				<p>the updated second paragraph</p>
				</blockquote>`)
		})

		test('updates the text inside a block with heading and paragraph', () => {
			const md = new Marmdown(new MfMDialect())
	
			md.textContent = sanitized`
				> # the original heading
				>
				> the original paragraph`
			md.update({ rangeOffset: 8, rangeLength: 9, text: 'updated ' }, () => 'dummy')
	
			expect(html(md)).toEqual(sanitized`
				<blockquote>
				<h1>the updated heading</h1>
				<p>the original paragraph</p>
				</blockquote>`)
		})
	})

	describe.skip('updates that change the document structure, but can be partially parsed', () => {
		//TODO implement
	})
	describe.skip('updates that change the document structure and require a complete re-parse', () => {
		//TODO implement
	})
})
