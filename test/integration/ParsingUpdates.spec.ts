import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "./html"
import { sanitized } from "./sanitize"

describe('MfM: Parsing updates', () => {
	describe('updates that preserve the document structure', () => {
		test.skip('update text in heading', () => {
			const md = new Marmdown(new MfMDialect())
	
			md.textContent = sanitized`# The heading content.`
			md.update({ rangeOffset: 6, rangeLength: 0, text: 'updated ' }, () => 'dummy')
	
			expect(html(md)).toEqual(sanitized`
				<h1>The updated heading content.</h1>`)
		})
	
		test.skip('update text in single-line paragraph', () => {
			const md = new Marmdown(new MfMDialect())
	
			md.textContent = sanitized`The text content.`
			md.update({ rangeOffset: 4, rangeLength: 0, text: 'updated ' }, () => 'dummy')
	
			expect(html(md)).toEqual(sanitized`
				<p>
				The updated text content.
				</p>`)
		})	
	})

	describe.skip('updates that change the document structure, but can be partially parsed', () => {
		//TODO implement
	})
	describe.skip('updates that change the document structure and require a complete re-parse', () => {
		//TODO implement
	})
})
