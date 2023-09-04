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

import { ContentUpdate } from "../../ContentUpdate"
import { isWhitespace } from "../../parser/isWhitespace"
import { MfMInlineElements } from "../../MfMDialect"
import { LineContent } from "../../element/Element"
import { GenericContainerInline } from "../../element/GenericElement"
import { Parser } from "../../parser/Parser"
import { parseInlineContent } from "../../parser/parse"
import { MfMTextParser } from "./MfMText"

export type MfMContentLineContent = MfMInlineElements
export class MfMContentLine extends GenericContainerInline<MfMContentLine, MfMContentLineContent, LineContent<MfMContentLine>, '--content-line--', MfMContentLineParser> {
	constructor(id: string, pw: MfMContentLineParser) { super(id, '--content-line--', pw) }
}
/**
 * Parses the text content of a single line of the heading. 
 * 
 * Since heading content is always just a single line of the heading, even
 * for multi-line headings, there cannot ba a `previous` object when parsing
 * heading content.
 */
export class MfMContentLineParser extends Parser<MfMContentLine, MfMContentLine, MfMTextParser> {
	public readonly elementName = 'MfMContentLine'

	parseLine(previous: MfMContentLine | null, text: string, start: number, length: number): MfMContentLine | null {
		if(previous != null) { throw new Error(`Cannot parse ${text.substring(start, start+length)} at ${start} because there cannot be a previous MfMContentLine when parsing heading content!`) }
		
		const textContent = new MfMContentLine(this.parsers.idGenerator.nextId(), this)

		const foundContents = parseInlineContent<MfMInlineElements>(text, start, length, this.parsers, {})
		foundContents.forEach(c => textContent.addContent(c))
	
		return textContent
	}

	override canUpdate(original: MfMContentLine, update: ContentUpdate, replacedText: string): boolean {
		const line = original.lines[0] //There can only be one, since MfMContentLine is a single line

		const rangeStart = update.rangeOffset
		const rangeEnd = update.rangeOffset+update.rangeLength
		const lineStart = line.start
		const lineEnd = line.start+line.length

		if(rangeStart===lineStart) {
			if(isWhitespace(update.text.charAt(0))) {
				return false
			}
			if(isWhitespace(replacedText.charAt(0))) {
				return false
			}
		}
		if(rangeEnd===lineEnd) {
			if(isWhitespace(update.text.charAt(update.text.length-1))) {
				return false
			}
			if(isWhitespace(replacedText.charAt(replacedText.length-1))) {
				return false
			}
		}

		return super.canUpdate(original, update, replacedText)
	}
}
