/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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

// Ensuring Compatibility with Older Presentations
// ===============================================
//
// Sometimes, how we use options to render parts of a presentation changes;
// e.g. we renamed "color=highlight" to "slide-design=highlight" for horizontal
// rules.
//
// To ensure backwards compatibility, the post processors in this file can
// translate the old option to the new one. The rendering code in <Presentation />
// then only has to know about the new options.

import { ContentOptions } from "./MarkdownOptions"

export function postprocessHeadingOptions(options: ContentOptions, level: number) {
	if(options['slide-color']) {
		options['slide-design'] = options['slide-color']
	}
	if(!options['break']) {
		if(level === 1) {
			options['break'] = 'slide'
		}
		if(level === 2) {
			options['break'] = 'column'
		}
	}
}

export function postprocessHorizontalRuleOptions(options: ContentOptions) {
	if(options['color']) {
		options['slide-design'] = options['color']
	}
	if(!options['break']) {
		options['break'] = 'slide-always'
	}
}
