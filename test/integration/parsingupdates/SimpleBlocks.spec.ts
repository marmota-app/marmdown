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

describe('MfM: Parsing updates - Simple Blocks', () => {
	const md = new Marmdown(new MfMDialect())

	test('update text in heading', () => {
		md.textContent = sanitized`# The heading content.`
		md.update({ rangeOffset: 6, rangeLength: 0, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<h1>The updated heading content.</h1>`)
	})

	test('update text in single-line paragraph', () => {
		md.textContent = sanitized`The text content.`
		md.update({ rangeOffset: 4, rangeLength: 0, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<p>The updated text content.</p>`)
	})
})
