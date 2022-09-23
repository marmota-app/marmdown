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
import {  DefaultContent, TextContent } from "$markdown/MarkdownDocument"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { Parsers } from "$markdown/Parsers"
import { UpdatableElement } from "$markdown/UpdatableElement"

export class UpdatableTextContent extends UpdatableElement<UpdatableTextContent> implements TextContent, DefaultContent {
	readonly type = 'Text' as const

	constructor(private _content: string, _start: number, _length: number, parsedWith: TextContentParser) {
		super(_start, _length, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this._content }
	get asText() { return this._content }
}

export class TextContentParser extends LeafTextParser<UpdatableTextContent> implements TextParser<UpdatableTextContent> {
	constructor(_: Parsers<never>) {
		super()
	}
	parse(text: string, start: number, length: number): ParserResult<UpdatableTextContent> | null {
		return {
			startIndex: start,
			length: length,
			content: new UpdatableTextContent(text.substring(start, start + length), start, length, this),
		}
	}
}
