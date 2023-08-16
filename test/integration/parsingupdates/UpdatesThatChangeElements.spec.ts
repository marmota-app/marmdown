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

describe('Updates that will split a paragraph', () => {
	const md = new Marmdown(new MfMDialect())

	it('Triggers re-parse when adding a third "*" token to make a thematic break', () => {
		md.textContent = sanitized`
			A paragraph with a first line
			**
			and a third line.`
		md.update({ rangeOffset: 30, rangeLength: 0, text: '*' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
	it('Triggers re-parse when adding ">" to make a general-purpose block', () => {
		md.textContent = sanitized`
			A paragraph with a first line
			This becomes a block
			and a third line.`
		md.update({ rangeOffset: 30, rangeLength: 0, text: '> ' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
	it('Triggers re-parse when adding "#" to make a heading', () => {
		md.textContent = sanitized`
			A paragraph with a first line
			This becomes a heading
			and a third line.`
		md.update({ rangeOffset: 30, rangeLength: 0, text: '# ' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})

	it('Triggers re-parse when adding a third "*" token to make a thematic break inside a general-purpose block', () => {
		md.textContent = sanitized`
			> A paragraph with a first line
			> **
			> and a third line.`
		md.update({ rangeOffset: 34, rangeLength: 0, text: '*' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
	it('Triggers re-parse when adding ">" to make a general-purpose block inside a general-purpose block', () => {
		md.textContent = sanitized`
			> A paragraph with a first line
			> This becomes a block
			> and a third line.`
		md.update({ rangeOffset: 34, rangeLength: 0, text: '> ' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
	it('Triggers re-parse when adding "#" to make a heading inside a general-purpose block', () => {
		md.textContent = sanitized`
			> A paragraph with a first line
			> This becomes a heading
			> and a third line.`
		md.update({ rangeOffset: 34, rangeLength: 0, text: '# ' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})

	it('Triggers re-parse when making the second line of a general purpose block a heading', () => {
		md.textContent = sanitized`
			> A paragraph with a first line
			> This becomes un-quoted
			> and a third line.`
		md.update({ rangeOffset: 32, rangeLength: 0, text: '#' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})

	it('Triggers re-parse when removing the ">" from a general purpose block', () => {
		md.textContent = sanitized`
			> A paragraph with a first line
			> This becomes un-quoted
			> and a third line.`
		md.update({ rangeOffset: 32, rangeLength: 2, text: '' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
	it('Triggers aa re-parse when quoting a heading', () => {
		md.textContent = sanitized`
			# The Heading`
		md.update({ rangeOffset: 0, rangeLength: 0, text: '> ' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
	it('Triggers aa re-parse when quoting a thematic break', () => {
		md.textContent = sanitized`
			***`
		md.update({ rangeOffset: 0, rangeLength: 0, text: '> ' }, () => 're-parse')

		expect(html(md)).toEqual(`<p>re-parse</p>`)
	})
})