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

describe('MfM: Asides (which are similar to GfM block quotes (https://github.github.com/gfm/#block-quote-marker) but use ^ as marker)', () => {
	const md = new Marmdown(new MfMDialect())

	test('A simple aside', () => {
		md.textContent = sanitized`
			^ # Foo
			^ bar
			^ baz`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<h1>Foo</h1>
			<p>bar
			baz</p>
			</aside>`)
	})

	test('Space after aside character can be omitted', () => {
		md.textContent = sanitized`
			^# Foo
			^bar
			^ baz`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<h1>Foo</h1>
			<p>bar
			baz</p>
			</aside>`)
	})

	test.skip('The aside character can be indented 1-3 characters', () => {
		md.textContent = sanitized`
			   ^ # Foo
			   ^ bar
			 ^ baz`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<h1>Foo</h1>
			<p>
			bar
			baz
			</p>
			</aside>`)
	})

	test.skip('Four spaces create a block instead of a aside', () => {
		md.textContent = sanitized`
			    ^ # Foo
			    ^ bar
			    ^ baz`
	
		expect(html(md)).toEqual(sanitized`
			<pre><code>^ # Foo
			^ bar
			^ baz
			</code></pre>`)
	})

	test('An aside can be empty', () => {
		md.textContent = sanitized`
			^`
	
		expect(html(md)).toEqual(sanitized`
			<aside>

			</aside>`)
	})
	test('An aside can be empty with multiple lines', () => {
		md.textContent = sanitized`
			^
			^  
			^ `
	
		expect(html(md)).toEqual(sanitized`
			<aside>

			</aside>`)
	})

	test('An aside can have initial or final blank lines', () => {
		md.textContent = sanitized`
			^
			^ foo
			^  `
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<p>foo</p>
			</aside>`)
	})

	test('A blank line always separates asides', () => {
		md.textContent = sanitized`
			^ foo

			^ bar`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<p>foo</p>
			</aside>
			<aside>
			<p>bar</p>
			</aside>`)
	})

	test('To get an aside with two paragraphs, use', () => {
		md.textContent = sanitized`
			^ foo
			^
			^ bar`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<p>foo</p>
			<p>bar</p>
			</aside>`)
	})

	test('Asides can interrupt paragraphs', () => {
		md.textContent = sanitized`
			foo
			^ bar`
	
		expect(html(md)).toEqual(sanitized`
			<p>foo</p>
			<aside>
			<p>bar</p>
			</aside>`)
	})

	test.skip('In general, blank lines are not needed before or after asides', () => {
		md.textContent = sanitized`
			^ aaa
			***
			^ bbb`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<p>aaa</p>
			</aside>
			<hr />
			<aside>
			<p>bbb</p>
			</aside>`)
	})

	test.skip('Aside with code block requires 5 spaces', () => {
		md.textContent = sanitized`
			^     code

			^    not code`
	
		expect(html(md)).toEqual(sanitized`
			<aside>
			<pre><code>code
			</code></pre>
			</aside>
			<aside>
			<p>not code</p>
			</aside>`)
	})
})
