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

describe('asText - Reproduce the original document for options', () => {
	md('a single-line heading with options')
		.canReproduce(sanitized`
			#{ the value; key2=value2; key3=value3} foo`)
	md('a three-line heading with options')
		.canReproduce(sanitized`
			####{ the value;
			key2 =\tvalue2; key3   = \t  value3\t } Some heading  
			with three lines  
			shoud reproduce document`)
	md('multiple headings with and without options')
		.canReproduce(sanitized`
			# I am the main heading
			##{ default value } heading 2



			####{ the value;
			key2 =\tvalue2; key3   = \t  value3\t } Some heading  
			with three lines  
			shoud reproduce document
			
			#{ key1=value1; key2=value2 } Another heading`)
	})

