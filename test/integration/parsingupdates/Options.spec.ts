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

describe('MfM: Parsing updates - Options', () => {
	const md = new Marmdown(new MfMDialect())

	test('update options in heading', () => {
		md.textContent = sanitized`#{ the value; key2=value2} The heading content.`
		md.update({ rangeOffset: 19, rangeLength: 0, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<h1 data-options="default=the value;key2=updated value2">The heading content.</h1>`)
	})

	test('update heading text after options', () => {
		md.textContent = sanitized`#{ the value; key2=value2} The heading content.`
		md.update({ rangeOffset: 31, rangeLength: 0, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<h1 data-options="default=the value;key2=value2">The updated heading content.</h1>`)
	})

	test('update options in multi-line heading', () => {
		md.textContent = sanitized`#{ the value;\nkey2=value2} The heading content.  \nWith a second line.`
		md.update({ rangeOffset: 19, rangeLength: 0, text: 'updated ' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<h1 data-options="default=the value;key2=updated value2">The heading content.
			With a second line.</h1>`)
	})

	test('update multi-line heading text after options', () => {
		md.textContent = sanitized`#{ the value;\nkey2=value2} The heading content.  \nWith a second line.`
		md.update({ rangeOffset: 56, rangeLength: 0, text: 'n updated' }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<h1 data-options="default=the value;key2=value2">The heading content.
			With an updated second line.</h1>`)
	})
})
