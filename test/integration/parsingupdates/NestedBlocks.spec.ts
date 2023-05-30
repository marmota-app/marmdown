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

describe('MfM: Parsing updates - Nested Blocks', () => {
	const md = new Marmdown(new MfMDialect())

	test('updates the text inside a block with two paragraphs', () => {
		md.textContent = sanitized`
			> the first paragraph
			> has two lines
			>
			> the original second paragraph`
		md.update({ rangeOffset: 46, rangeLength: 9, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<p>the first paragraph
			has two lines</p>
			
			<p>the updated second paragraph</p>
			</blockquote>`)
	})

	test('updates the text inside a block with heading and paragraph', () => {
		md.textContent = sanitized`
			> # the original heading
			>
			> the original paragraph`
		md.update({ rangeOffset: 8, rangeLength: 9, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<h1>the updated heading</h1>

			<p>the original paragraph</p>
			</blockquote>`)
	})

	test('updates the text inside a multiply-nested block with heading and paragraph', () => {
		md.textContent = sanitized`
			> ^ >> # the original heading
			>
			> the original paragraph`
		md.update({ rangeOffset: 13, rangeLength: 9, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<blockquote>
			<aside>
			<blockquote>
			<blockquote>
			<h1>the updated heading</h1>
			</blockquote>
			</blockquote>
			</aside>

			<p>the original paragraph</p>
			</blockquote>`)
	})
})
