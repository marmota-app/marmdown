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
import { ContainerTextParser, TextParser } from "$markdown/parser/TextParser"
import { Parsers } from "$markdown/Parsers"
import { ParsedDocumentContent } from "$markdown/Updatable"
import { UpdatableElement } from "$markdown/UpdatableElement"

export class ParsedText extends ParsedDocumentContent<UpdatableText, unknown> implements TextContent, DefaultContent {
	readonly type = 'Text' as const

	constructor(public text: string, start: number, private _length: number) {
		super(start)
	}

	get hasChanged() { return false }
	get content() { return this.text.substring(this.start, this.start+this._length) }
	override get length(): number {
		return this._length
	}
}
export class UpdatableText extends UpdatableElement<UpdatableText, unknown, ParsedText> {

	constructor(private text: string, start: number, private _length: number, parsedWith: TextContentParser) {
		super()
	}

	public get isFullyParsed(): boolean {
		return true
	}
}

export class TextContentParser extends ContainerTextParser<unknown, UpdatableText, ParsedText> {
	constructor(_: Parsers<never>) {
		super()
	}
	parse(previous: UpdatableText | null, text: string, start: number, length: number): [ UpdatableText | null, ParsedText | null] {
		//TODO belongsTo, return value

		return [null, new ParsedText(text, start, length)]
	}
}
