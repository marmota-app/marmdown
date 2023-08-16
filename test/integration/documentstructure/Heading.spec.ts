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
import { sanitized } from "../sanitize"
import { structure } from "../structure"

describe('Document Structure - Headings', () => {
	const md = new Marmdown(new MfMDialect())

	test('Simple headings (https://github.github.com/gfm/#example-32)', () => {
		md.textContent = sanitized`
			# foo
			## foo
			### foo`

		expect(structure(md)).toEqual(sanitized`
			section 1
				heading 1
					--content-line--
						text
				section 2
					heading 2
						--content-line--
							text
					section 3
						heading 3
							--content-line--
								text`)
	})
	test('Simple headings (https://github.github.com/gfm/#example-32)', () => {
		md.textContent = sanitized`
			# foo
			## foo
			# foo
			### foo`

		expect(structure(md)).toEqual(sanitized`
			section 1
				heading 1
					--content-line--
						text
				section 2
					heading 2
						--content-line--
							text
			section 1
				heading 1
					--content-line--
						text
				section 3
					heading 3
						--content-line--
							text`)
	})
})