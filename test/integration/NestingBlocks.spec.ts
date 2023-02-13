import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "./html"
import { sanitized } from "./sanitize"

describe('MfM: Nesting blocks', () => {
	const md = new Marmdown(new MfMDialect())
	test('blockquote > p', () => {
		md.textContent = sanitized`
			> Sphinx of black quartz,
			> judge my vow.
			>
			> And another paragraph`

		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<p>Sphinx of black quartz,
			judge my vow.</p>
			<p>And another paragraph</p>
			</blockquote>`)
	})
	test('p + blockquote',() => {
		md.textContent = sanitized`
			Sphinx of black quartz,
			judge my vow.
			> And another paragraph, inside a blockquote`

		expect(html(md)).toEqual(sanitized`
			<p>Sphinx of black quartz,
			judge my vow.</p>
			<blockquote>
			<p>And another paragraph, inside a blockquote</p>
			</blockquote>`)
	})
	test('aside > blockquote > p', () => {
		md.textContent = sanitized`
			^ > Sphinx of black quartz,
			^ > judge my vow.
			^
			^ > And another paragraph`

		expect(html(md)).toEqual(sanitized`
			<aside>
			<blockquote>
			<p>Sphinx of black quartz,
			judge my vow.</p>
			</blockquote>
			<blockquote>
			<p>And another paragraph</p>
			</blockquote>
			</aside>`)
	})
	test.skip('blockquote > ul > li > p', () => {
		md.textContent = sanitized`
			> * Sphinx of black quartz,
			> * judge my vow.`

		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<ul>
			<li>
			<p>Sphinx of black quartz,</p>
			</li>
			<li>
			<p>judge my vow.</p>
			</li>
			</ul>
			</blockquote>`)
	})
})
