import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "../html"
import { sanitized } from "../sanitize"

describe('GfM: Paragraphs (https://github.github.com/gfm/#paragraphs)', () => {
	const md = new Marmdown(new MfMDialect())

	test.skip('Two single-line paragraphs (https://github.github.com/gfm/#example-189)', () => {
		md.textContent = sanitized`
			aaa

			bbb`
		
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa
			</p>
			<p>
			bbb
			</p>`)
	})

	test.skip('Paragraphs with multiple lines (https://github.github.com/gfm/#example-190)', () => {
		md.textContent = sanitized`
			aaa
			bbb
			
			ccc
			ddd`
		
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa
			bbb
			</p>
			<p>
			ccc
			ddd
			</p>`)
	})

	test.skip('Paragraphs with multiple blank lines (https://github.github.com/gfm/#example-191)', () => {
		md.textContent = sanitized`
			aaa


			bbb`
		
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa
			</p>
			<p>
			bbb
			</p>`)
	})

	test.skip('Skipping leading spaces (https://github.github.com/gfm/#example-192)', () => {
		md.textContent = sanitized`
			  aaa
			 bbb`
	
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa
			bbb
			</p>`)
	})

	test.skip('Lines after the first may be indented any amount, since indented code blocks cannot interrupt paragraphs (https://github.github.com/gfm/#example-193)', () => {
		md.textContent = sanitized`
			aaa
			      bbb
			           ccc`
	
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa
			bbb
			ccc
			</p>`)
	})

	test.skip('Indentation of three spaces creates paragraph (https://github.github.com/gfm/#example-194)', () => {
		md.textContent = sanitized`
			   aaa
			bbb`
	
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa
			bbb
			</p>`)
	})

	test.skip('Indentation of more than three spaces triggers code block, not paragraph (https://github.github.com/gfm/#example-195)', () => {
		md.textContent = sanitized`
			    aaa
			bbb`
	
		expect(html(md)).toEqual(sanitized`
			<pre>
			<code>
			aaa
			</code>
			</pre>
			<p>
			bbb
			</p>`)
	})

	test.skip('paragraphs cannot end with a hard break (https://github.github.com/gfm/#example-196)', () => {
		md.textContent = sanitized`
			aaa     
			bbb     `
	
		expect(html(md)).toEqual(sanitized`
			<p>
			aaa<br />
			bbb
			</p>`)
	})
})
