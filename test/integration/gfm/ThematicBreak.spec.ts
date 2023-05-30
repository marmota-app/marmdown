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

import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "../html"
import { sanitized } from "../sanitize"

describe('GfM: Thematic Breaks (https://github.github.com/gfm/#thematic-breaks)', () => {
	const md = new Marmdown(new MfMDialect())

	test('Three or more matching -, _, or * characters (https://github.github.com/gfm/#example-13)', () => {
		md.textContent = sanitized`
			***
			---
			___`
		
		expect(html(md)).toEqual(sanitized`
			<hr />
			<hr />
			<hr />`)
	})

	test('Wrong characters (https://github.github.com/gfm/#example-14)', () => {
		md.textContent = sanitized`
			+++
			
			===`
		
		expect(html(md)).toEqual(sanitized`
			<p>+++</p>
			
			<p>===</p>`)
	})

	test('Not enough characters (https://github.github.com/gfm/#example-16)', () => {
		md.textContent = sanitized`
			--
			**
			__`
		
		expect(html(md)).toEqual(sanitized`
			<p>--
			**
			__</p>`)
	})

	test('One to three spaces indent are allowed (https://github.github.com/gfm/#example-17)', () => {
		md.textContent = sanitized`
			 ***
			  ***
			   ***`
		
		expect(html(md)).toEqual(sanitized`
			<hr />
			<hr />
			<hr />`)
	})

	test.skip('Four spaces is too many (https://github.github.com/gfm/#example-18)', () => {
		//Must wait until indented code blocks are implemented
		md.textContent = sanitized`
			    ***`
		
		expect(html(md)).toEqual(sanitized`
			<pre><code>***
			</code></pre>`)
	})

	test('Four spaces is too many (paragraph) (https://github.github.com/gfm/#example-19)', () => {
		md.textContent = sanitized`
			Foo
			    ***`
		
		expect(html(md)).toEqual(sanitized`
			<p>Foo
			    ***</p>`)
	})

	test('More than three characters may be used (https://github.github.com/gfm/#example-20)', () => {
		md.textContent = sanitized`
			_____________________________________`
		
		expect(html(md)).toEqual(sanitized`
			<hr />`)
	});

	[' - - -', ' **  * ** * ** * **', '-     -      -      -'].forEach(b => test(`Spaces are allowed between the characters ("${b}") (https://github.github.com/gfm/#example-21)`, () => {
		md.textContent = sanitized`
			${b}`

		expect(html(md)).toEqual(sanitized`
			<hr />`)
	}))

	test('Spaces are allowed at the end (https://github.github.com/gfm/#example-24)', () => {
		md.textContent = sanitized`
			- - - -    `
		
		expect(html(md)).toEqual(sanitized`
			<hr />`)
	})

	test('However, no other characters may occur in the line (https://github.github.com/gfm/#example-25)', () => {
		md.textContent = sanitized`
			_ _ _ _ a

			a------
			
			---a---`
		
		expect(html(md)).toEqual(sanitized`
			<p>_ _ _ _ a</p>

			<p>a------</p>

			<p>---a---</p>`)
	})

	test.skip('It is required that all of the non-whitespace characters be the same (https://github.github.com/gfm/#example-26)', () => {
		//Must wait until emphasis is implemented
		md.textContent = sanitized`
			 *-*`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>-</em></p>`)
	})

	test.skip('Thematic breaks do not need blank lines before or after (https://github.github.com/gfm/#example-27)', () => {
		//Must wait until lists are implemented
		md.textContent = sanitized`
			- foo
			***
			- bar`
		
		expect(html(md)).toEqual(sanitized`
			<ul>
			<li>foo</li>
			</ul>
			<hr />
			<ul>
			<li>bar</li>
			</ul>`)
	})

	test('Thematic breaks can interrupt a paragraph (https://github.github.com/gfm/#example-28)', () => {
		md.textContent = sanitized`
			Foo
			***
			bar`
		
		expect(html(md)).toEqual(sanitized`
			<p>Foo</p>
			<hr />
			<p>bar</p>`)
	})

	test('Dashes as setext heading (https://github.github.com/gfm/#example-29)', () => {
		expect('Intentionally not implemented: No setext headings').not.toBeNull()
	})

	test.skip('When both a thematic break and a list item are possible interpretations of a line, the thematic break takes precedence (https://github.github.com/gfm/#example-30)', () => {
		//Must wait until lists are implemented
		md.textContent = sanitized`
			* Foo
			* * *
			* Bar`
		
		expect(html(md)).toEqual(sanitized`
			<ul>
			<li>Foo</li>
			</ul>
			<hr />
			<ul>
			<li>Bar</li>
			</ul>`)
	})

	test.skip('If you want a thematic break in a list item, use a different bullet (https://github.github.com/gfm/#example-31)', () => {
		//Must wait until lists are implemented
		md.textContent = sanitized`
			- Foo
			- * * *`
		
		expect(html(md)).toEqual(sanitized`
			<ul>
			<li>Foo</li>
			<li>
			<hr />
			</li>
			</ul>`)
	})
})
