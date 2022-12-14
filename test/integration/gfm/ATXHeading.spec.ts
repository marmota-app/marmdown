import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "../html"
import { sanitized } from "../sanitize"

describe('GfM: ATX Headings (https://github.github.com/gfm/#atx-heading)', () => {
	const md = new Marmdown(new MfMDialect())

	test('Simple headings (https://github.github.com/gfm/#example-32)', () => {
		md.textContent = sanitized`
			# foo
			## foo
			### foo
			#### foo
			##### foo
			###### foo`

		expect(html(md)).toEqual(sanitized`
			<h1>foo</h1>
			<h2>foo</h2>
			<h3>foo</h3>
			<h4>foo</h4>
			<h5>foo</h5>
			<h6>foo</h6>`)
	})
})