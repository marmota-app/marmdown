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

describe('MfM: Parsing updates - Multiple Updates', () => {
	const md = new Marmdown(new MfMDialect())

	test('parsing two updates, in heading and paragraph', () => {
		md.textContent = sanitized`
			# The heading content.
			And some more paragraph content
			with two lines.`
		md.update({ rangeOffset: 6, rangeLength: 0, text: 'updated ' }, () => 'dummy')
		md.update({ rangeOffset: 37, rangeLength: 0, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<h1>The updated heading content.</h1>
			<p>And some more updated paragraph content
			with two lines.</p>`)

	})

	test.skip('parsing two updates, in bold and italic of two paragraphs', () => {})
})
