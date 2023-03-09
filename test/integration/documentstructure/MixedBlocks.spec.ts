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

describe('Document Structure - Mixed Blocks', () => {
	const md = new Marmdown(new MfMDialect())
	
	test('block with paragraph content', () => {
		md.textContent = sanitized`
			some text
			more text
			
			# a heading
			next paragraph
			
			## a sub heading
			
			and another paragraph
			with two lines`

		expect(structure(md)).toEqual(sanitized`
			section 1
				paragraph
					content-line
						text
					content-line
						text
			section 1
				heading 1
					content-line
						text
				paragraph
					content-line
						text
				section 2
					heading 2
						content-line
							text
					paragraph
						content-line
							text
						content-line
							text`)
	})

	test('paragraph and block', () => {
		md.textContent = sanitized`
			some paragraph
			> a block
			another paragraph`

		expect(structure(md)).toEqual(sanitized`
			section 1
				paragraph
					content-line
						text
				block
					paragraph
						content-line
							text
				paragraph
					content-line
						text`)
	})

	test('block with content', () => {
		md.textContent = sanitized`
			> some text
			> more text
			>
			> # a heading
			> next paragraph`

		expect(structure(md)).toEqual(sanitized`
			section 1
				block
					paragraph
						content-line
							text
						content-line
							text
					section 1
						heading 1
							content-line
								text
						paragraph
							content-line
								text`)
	})
})