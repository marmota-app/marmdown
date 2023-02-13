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

describe('GfM: ATX Headings (https://github.github.com/gfm/#atx-heading)', () => {
	const md = new Marmdown(new MfMDialect())

	test('Simple headings (https://github.github.com/gfm/#example-32)', () => {
		md.textContent = sanitized`
			# foo
			## foo
			### foo
			#### foo
			##### foo
			###### foo`

		expect(html(md)).toEqual(sanitized`
			<h1>foo</h1>
			<h2>foo</h2>
			<h3>foo</h3>
			<h4>foo</h4>
			<h5>foo</h5>
			<h6>foo</h6>`)
	})
})