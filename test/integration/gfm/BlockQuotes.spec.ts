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

describe('GfM: Block quotes (https://github.github.com/gfm/#block-quote-marker)', () => {
	const md = new Marmdown(new MfMDialect())

	test('A simple block quote (https://github.github.com/gfm/#example-206)', () => {
		md.textContent = sanitized`
			> # Foo
			> bar
			> baz`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<h1>Foo</h1>
			<p>bar
			baz</p>
			</blockquote>`)
	})

	test('Space after block quote character can be omitted (https://github.github.com/gfm/#example-207)', () => {
		md.textContent = sanitized`
			># Foo
			>bar
			> baz`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<h1>Foo</h1>
			<p>bar
			baz</p>
			</blockquote>`)
	})

	test.skip('The block quote character can be indented 1-3 characters (https://github.github.com/gfm/#example-208)', () => {
		md.textContent = sanitized`
			   > # Foo
			   > bar
			 > baz`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<h1>Foo</h1>
			<p>
			bar
			baz
			</p>
			</blockquote>`)
	})

	test.skip('Four spaces create a block instead of a block quote (https://github.github.com/gfm/#example-209)', () => {
		md.textContent = sanitized`
			    > # Foo
			    > bar
			    > baz`
	
		expect(html(md)).toEqual(sanitized`
			<pre><code>&gt; # Foo
			&gt; bar
			&gt; baz
			</code></pre>`)
	})

	//Examples 210-216 are about special cases for lazyness that we'll probably
	//never implement... I don't think the lazyness clause adds value here.

	test('A block quote can be empty (https://github.github.com/gfm/#example-217)', () => {
		md.textContent = sanitized`
			>`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>

			</blockquote>`)
	})
	test('A block quote can be empty with multiple lines(https://github.github.com/gfm/#example-218)', () => {
		md.textContent = sanitized`
			>
			>  
			> `
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>

			</blockquote>`)
	})

	test('A block quote can have initial or final blank lines (https://github.github.com/gfm/#example-219)', () => {
		md.textContent = sanitized`
			>
			> foo
			>  `
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<p>foo</p>
			</blockquote>`)
	})

	test('A blank line always separates block quotes (https://github.github.com/gfm/#example-220)', () => {
		md.textContent = sanitized`
			> foo

			> bar`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<p>foo</p>
			</blockquote>
			<blockquote>
			<p>bar</p>
			</blockquote>`)
	})
	//Example 221 is about removing the empty line from 220, which is a test
	//that we already have!

	test('To get a block quote with two paragraphs, use (https://github.github.com/gfm/#example-222)', () => {
		md.textContent = sanitized`
			> foo
			>
			> bar`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<p>foo</p>
			<p>bar</p>
			</blockquote>`)
	})

	test('Block quotes can interrupt paragraphs (https://github.github.com/gfm/#example-223)', () => {
		md.textContent = sanitized`
			foo
			> bar`
	
		expect(html(md)).toEqual(sanitized`
			<p>foo</p>
			<blockquote>
			<p>bar</p>
			</blockquote>`)
	})

	test.skip('In general, blank lines are not needed before or after block quotes (https://github.github.com/gfm/#example-224)', () => {
		md.textContent = sanitized`
			> aaa
			***
			> bbb`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<p>aaa</p>
			</blockquote>
			<hr />
			<blockquote>
			<p>bbb</p>
			</blockquote>`)
	})
	//After this one, there are some test.skips about lazyness again...

	test.skip('Block quote with code block requires 5 spaces (https://github.github.com/gfm/#example-230)', () => {
		md.textContent = sanitized`
			>     code

			>    not code`
	
		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<pre><code>code
			</code></pre>
			</blockquote>
			<blockquote>
			<p>not code</p>
			</blockquote>`)
	})
})
