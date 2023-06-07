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

describe('GfM: Emphasis and strong emphasis (https://github.github.com/gfm/#emphasis-and-strong-emphasis)', () => {
	const md = new Marmdown(new MfMDialect())

	test.skip('Simple Emphasis (https://github.github.com/gfm/#example-360)', () => {
		md.textContent = sanitized`
			*foo bar*`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>foo bar</em></p>`)
	})

	test.skip('Not emphasis: * is followed by whitespace (https://github.github.com/gfm/#example-361)', () => {
		md.textContent = sanitized`
			a * foo bar*`
		
		expect(html(md)).toEqual(sanitized`
			<p>a * foo bar*</p>`)
	})

	test.skip('Not emphasis: * is preceded by an alphanumeric and followed by punctuation (https://github.github.com/gfm/#example-362)', () => {
		md.textContent = sanitized`
			a*"foo"*`
		
		expect(html(md)).toEqual(sanitized`
			<p>a*&quot;foo&quot;*</p>`)
	})

	test.skip('Unicode nonbreaking spaces (https://github.github.com/gfm/#example-363)', () => {
		md.textContent = sanitized`
			* a *`
		
		expect(html(md)).toEqual(sanitized`
			<p>* a *</p>`)
	})

	test.skip('Intraword emphasis with * is permitted (1) (https://github.github.com/gfm/#example-364)', () => {
		md.textContent = sanitized`
			foo*bar*`
		
		expect(html(md)).toEqual(sanitized`
			<p>foo<em>bar</em></p>`)
	})

	test.skip('Intraword emphasis with * is permitted (2) (https://github.github.com/gfm/#example-365)', () => {
		md.textContent = sanitized`
			5*6*78`
		
		expect(html(md)).toEqual(sanitized`
			<p>5<em>6</em>78</p>`)
	})

	test.skip('Simple emphasis with underscore (https://github.github.com/gfm/#example-366)', () => {
		md.textContent = sanitized`
			_foo bar_`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>foo bar</em></p>`)
	})

	test.skip('Not emphasis: _ is followed by whitespace (https://github.github.com/gfm/#example-367)', () => {
		md.textContent = sanitized`
			_ foo bar_`
		
		expect(html(md)).toEqual(sanitized`
			<p>_ foo bar_</p>`)
	})

	test.skip('Not emphasis: _ is preceded by an alphanumeric and followed by punctuation (https://github.github.com/gfm/#example-368)', () => {
		md.textContent = sanitized`
			a_"foo"_`
		
		expect(html(md)).toEqual(sanitized`
			<p>a_&quot;foo&quot;_</p>`)
	})

	test.skip('Emphasis with _ is not allowed inside words (1) (https://github.github.com/gfm/#example-369)', () => {
		md.textContent = sanitized`
			foo_bar_`
		
		expect(html(md)).toEqual(sanitized`
			<p>foo_bar_</p>`)
	})

	test.skip('Emphasis with _ is not allowed inside words (2) (https://github.github.com/gfm/#example-370)', () => {
		md.textContent = sanitized`
			5_6_78`
		
		expect(html(md)).toEqual(sanitized`
			<p>5_6_78</p>`)
	})

	test.skip('Here _ does not generate emphasis, because the first delimiter run is right-flanking and the second left-flanking (https://github.github.com/gfm/#example-372)', () => {
		md.textContent = sanitized`
			aa_"bb"_cc`
		
		expect(html(md)).toEqual(sanitized`
			<p>aa_&quot;bb&quot;_cc</p>`)
	})

	test.skip('Emphasis: opening delimiter is both left- and right-flanking, but it is preceded by punctuation (https://github.github.com/gfm/#example-373)', () => {
		md.textContent = sanitized`
			foo-_(bar)_`
		
		expect(html(md)).toEqual(sanitized`
			<p>foo-<em>(bar)</em></p>`)
	})

	test.skip('Not emphasis: closing delimiter does not match the opening delimiter (https://github.github.com/gfm/#example-374)', () => {
		md.textContent = sanitized`
			_foo*`
		
		expect(html(md)).toEqual(sanitized`
			<p>_foo*</p>`)
	})

	test.skip('Not emphasis: * is preceded by whitespace (https://github.github.com/gfm/#example-375)', () => {
		md.textContent = sanitized`
			*foo bar *`
		
		expect(html(md)).toEqual(sanitized`
			<p>*foo bar *</p>`)
	})

	test.skip('Not emphasis: * is preceded by punctuation and followed by an alphanumeric (1) (https://github.github.com/gfm/#example-377)', () => {
		md.textContent = sanitized`
			*(*foo)`
		
		expect(html(md)).toEqual(sanitized`
			<p>*(*foo)</p>`)
	})

	test.skip('Not emphasis: * is preceded by punctuation and followed by an alphanumeric (2) (Illustrating the point of (1)) (https://github.github.com/gfm/#example-378)', () => {
		md.textContent = sanitized`
			*(*foo*)*`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>(<em>foo</em>)</em></p>`)
	})

	test.skip('Intraword emphasis with * is allowed (https://github.github.com/gfm/#example-379)', () => {
		md.textContent = sanitized`
			*foo*bar`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>foo</em>bar</p>`)
	})

	test.skip('Not emphasis: closing _ is preceded by whitespace (https://github.github.com/gfm/#example-380)', () => {
		md.textContent = sanitized`
			_foo bar _`
		
		expect(html(md)).toEqual(sanitized`
			<p>_foo bar _</p>`)
	})

	test.skip('Not emphasis: the second _ is preceded by punctuation and followed by an alphanumeric (https://github.github.com/gfm/#example-381)', () => {
		md.textContent = sanitized`
			_(_foo)`
		
		expect(html(md)).toEqual(sanitized`
			<p>_(_foo)</p>`)
	})

	test.skip('emphasis within emphasis (https://github.github.com/gfm/#example-382)', () => {
		md.textContent = sanitized`
			_(_foo_)_`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>(<em>foo</em>)</em></p>`)
	})

	test.skip('emphasis, even though the closing delimiter is both left- and right-flanking, because it is followed by punctuation (https://github.github.com/gfm/#example-386)', () => {
		md.textContent = sanitized`
			_(bar)_.`
		
		expect(html(md)).toEqual(sanitized`
			<p><em>(bar)</em>.</p>`)
	})

	test.skip('Strong emphasis (https://github.github.com/gfm/#example-387)', () => {
		md.textContent = sanitized`
			**foo bar**`
		
		expect(html(md)).toEqual(sanitized`
			<p><strong>foo bar</strong></p>`)
	})

	test.skip('Not strong emphasis: opening delimiter is followed by whitespace (https://github.github.com/gfm/#example-388)', () => {
		md.textContent = sanitized`
			** foo bar**`
		
		expect(html(md)).toEqual(sanitized`
			<p>** foo bar**</p>`)
	})

	test.skip('Not strong emphasis: ** is preceded by an alphanumeric and followed by punctuation (https://github.github.com/gfm/#example-389)', () => {
		md.textContent = sanitized`
			a**"foo"**`
		
		expect(html(md)).toEqual(sanitized`
			<p>a**&quot;foo&quot;**</p>`)
	})

	test.skip('Intraword strong emphasis with ** is permitted (https://github.github.com/gfm/#example-390)', () => {
		md.textContent = sanitized`
			foo**bar**`
		
		expect(html(md)).toEqual(sanitized`
			<p>foo<strong>bar</strong></p>`)
	})

	test.skip('Strong emphasis with underscore (https://github.github.com/gfm/#example-391)', () => {
		md.textContent = sanitized`
			__foo bar__`
		
		expect(html(md)).toEqual(sanitized`
			<p><strong>foo bar</strong></p>`)
	})

	test.skip('Not strong emphasis: opening delimiter is followed by whitespace (https://github.github.com/gfm/#example-392)', () => {
		md.textContent = sanitized`
			__ foo bar__`
		
		expect(html(md)).toEqual(sanitized`
			<p>__ foo bar__</p>`)
	})

	test.skip('Not strong emphasis: opening __ is preceded by an alphanumeric and followed by punctuation (https://github.github.com/gfm/#example-394)', () => {
		md.textContent = sanitized`
			a__"foo"__`
		
		expect(html(md)).toEqual(sanitized`
			<p>a__&quot;foo&quot;__</p>`)
	})

	test.skip('Intraword strong emphasis is forbidden with __ (1) (https://github.github.com/gfm/#example-395)', () => {
		md.textContent = sanitized`
			foo__bar__`
		
		expect(html(md)).toEqual(sanitized`
			<p>foo__bar__</p>`)
	})

	test.skip('Intraword strong emphasis is forbidden with __ (1) (https://github.github.com/gfm/#example-396)', () => {
		md.textContent = sanitized`
			5__6__78`
		
		expect(html(md)).toEqual(sanitized`
			<p>5__6__78</p>`)
	})

	test.skip('Intraword strong emphasis is forbidden with __ (1) (https://github.github.com/gfm/#example-398)', () => {
		md.textContent = sanitized`
			__foo, __bar__, baz__`
		
		expect(html(md)).toEqual(sanitized`
			<p><strong>foo, <strong>bar</strong>, baz</strong></p>`)
	})

	test.skip('Emphasis: the opening delimiter is both left- and right-flanking, but it is preceded by punctuation (https://github.github.com/gfm/#example-399)', () => {
		md.textContent = sanitized`
			foo-__(bar)__`
		
		expect(html(md)).toEqual(sanitized`
			<p>foo-<strong>(bar)</strong></p>`)
	})

	test.skip('Not strong emphasis: closing delimiter is preceded by whitespace (https://github.github.com/gfm/#example-400)', () => {
		md.textContent = sanitized`
			**foo bar **`
		
		expect(html(md)).toEqual(sanitized`
			<p>**foo bar **</p>`)
	})

	/*
	test.skip(' ()', () => {
		md.textContent = sanitized`
			`
		
		expect(html(md)).toEqual(sanitized`
			`)
	})
	*/
})