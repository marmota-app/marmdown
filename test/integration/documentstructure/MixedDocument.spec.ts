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
import { sanitized } from "../sanitize"
import { structure } from "../structure"

describe('Document Structure - Headings', () => {
	const md = new Marmdown(new MfMDialect())

	test('A document with mixed sections, paragraphs and headings', () => {
		md.textContent = sanitized`
			first paragraph
			with two lines

			second paragraph
			again with two lines

			# a heading  
			with a second line

			another paragraph
			that also has two lines
			
			and the fourth paragraph`

		expect(structure(md)).toEqual(sanitized`
			section 1
				paragraph
					--content-line--
						text
					--content-line--
						text
			
				paragraph
					--content-line--
						text
					--content-line--
						text
			
			section 1
				heading 1
					--content-line--
						text
					--content-line--
						text
			
				paragraph
					--content-line--
						text
					--content-line--
						text
			
				paragraph
					--content-line--
						text`)
	})
})