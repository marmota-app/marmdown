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

import { Marmdown } from "../../../src/Marmdown"
import { MfMDialect } from "../../../src/MfMDialect"
import { html } from "../html"
import { sanitized } from "../sanitize"

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
	test('blockquote > blockquote > aside > p', () => {
		md.textContent = sanitized`
			before
			> block quote
			> > nested block quote
			> > ^ aside
			> > after aside
			> after nested
			after`

		expect(html(md)).toEqual(sanitized`
			<p>before</p>
			<blockquote>
			<p>block quote</p>
			<blockquote>
			<p>nested block quote</p>
			<aside>
			<p>aside</p>
			</aside>
			<p>after aside</p>
			</blockquote>
			<p>after nested</p>
			</blockquote>
			<p>after</p>`)
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
