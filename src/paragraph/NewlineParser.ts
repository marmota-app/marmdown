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
import { AdvancedConent, DefaultContent, Newline } from "$markdown/MarkdownDocument"
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions"
import { OptionsParser } from "$markdown/options/OptionsParser"
import { find, findOne } from "$markdown/parser/find"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { UpdatableElement } from "$markdown/UpdatableElement"

export class UpdatableNewlineContent extends UpdatableElement<UpdatableNewlineContent> implements Newline, DefaultContent {
	readonly type = 'Newline' as const

	constructor(private _content: string, _start: number, _length: number, parsedWith: NewlineContentParser) {
		super(_start, _length, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this._content }
	get asText() { return this._content }
}

export class NewlineContentParser extends LeafTextParser<UpdatableNewlineContent> implements TextParser<UpdatableNewlineContent> {
	parse(text: string, start: number, length: number): ParserResult<UpdatableNewlineContent> | null {
		let i = 0
		const whenFound = (l: number) => i+=l

		const newLine = findOne(text, ['\r\n', '\r', '\n'], start+i, length-i, { whenFound })
		if(newLine) {
			return {
				startIndex: start,
				length: i,
				content: new UpdatableNewlineContent(newLine.completeText, start, i, this),
			}
		}

		return null
	}
}
