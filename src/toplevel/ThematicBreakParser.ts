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

import { DefaultContent, HorizontalRule } from "$markdown/MarkdownDocument"
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions"
import { find } from "$markdown/parser/find"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { UpdatableElement } from "$markdown/UpdatableElement"

export class UpdatableHorizontalRuleContent extends UpdatableElement<UpdatableHorizontalRuleContent> implements HorizontalRule, DefaultContent {
	readonly type = 'HorizontalRule' as const
	readonly level = 1 as const

	constructor(public readonly allOptions: Options, private _parts: string[], _start: number, _length: number, parsedWith: ThematicBreakParser) {
		super(_start, _length, parsedWith)
	}

	get options() { return this.allOptions.asMap }
	get hasChanged() { return false }
	get asText() { return this._parts.join() }
}

export class ThematicBreakParser extends LeafTextParser<UpdatableHorizontalRuleContent> implements TextParser<UpdatableHorizontalRuleContent> {
	parse(text: string, start: number, length: number): ParserResult<UpdatableHorizontalRuleContent> | null {
		let options: Options = new UpdatableOptions([], -1)

		const parts: string[] = []
		let i = 0
		const textFound = (l: number, t: string) => { i+=l, parts.push(t) }


		if(find(text, /[*-_]([ \t]*[*-_])([ \t]*[*-_])+/, start, length, textFound, 3)) {
			return {
				startIndex: start,
				length: i,
				content: new UpdatableHorizontalRuleContent(options, parts, 0, length, this),
			}	
		}

		return null
	}
}
