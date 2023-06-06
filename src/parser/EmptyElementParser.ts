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

import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Empty } from "$element/MarkdownElements"
import { MfMText } from "$mfm/inline/MfMText"
import { Parser } from "./Parser"
import { isEmpty } from "./find"

export class EmptyElement extends GenericBlock<EmptyElement, never, '--empty--', EmptyElementParser> implements Empty<EmptyElement, never> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: EmptyElementParser) { super(id, '--empty--', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export class EmptyElementParser extends Parser<EmptyElement> {
	public readonly elementName = 'EmptyElement'

	parseLine(previous: EmptyElement | null, text: string, start: number, length: number): EmptyElement | null {
		if(isEmpty(text, start, length)) {
				const element = previous ?? new EmptyElement(this.parsers.idGenerator.nextId(), this)
				element.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), element))
				element.lines[element.lines.length-1].content.push(new StringLineContent(text.substring(start, start+length), start, length, element))

				return element
		}

		if(previous) { previous.continueWithNextLine = false }
		return null
	}
}
