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

describe('Document Structure - Options', () => {
	const md = new Marmdown(new MfMDialect())

	test('Structure of multi-line heading with options', () => {
		md.textContent = sanitized`
			#{ the value; key2=value2;
			key3=value3;} First heading line  
			second heading line  
			third heading line`

		expect(structure(md)).toEqual(sanitized`
			section 1
				heading 1
					options
						option[default]
						option[key2]
						option[key3]
					content-line
						text
					content-line
						text
					content-line
						text`)
	})
})