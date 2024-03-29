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

import { sanitized } from "../sanitize"
import { md } from "../md"

describe('asText - Reproduce the original document for multiple blocks', () => {
	md('text content with "empty" section at the start and another section')
		.canReproduce(sanitized`
			some paragraph content
			with two lines
			
			# The next section
			
			with more paragraph content`)

	md('paragraphs and block quotes')
		.canReproduce(sanitized`
			here is a paragraph
			with two lines
			> interrupted by a block quote
			> # that even contains a heading
			>
			> and more paragraph content
			
			and another paragraph,
			after the block quote`)

	md('nested block quotes and asides')
		.canReproduce(sanitized`
			> a block quote
			> > that contains another block quote
			> > ^ containing even an aside
			> there's more content
			> ^ and another aside
			
			^ and at the toplevel, there is
			^ ## an aside
			^ too`)
})
