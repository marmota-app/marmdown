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

import { Element, ParsedLine, StringLineContent } from "../../element/Element"
import { Paragraph } from "../../element/MarkdownElements"
import { MfMContentLine, MfMContentLineParser } from "../inline/MfMContentLine"
import { MfMGenericBlock } from "../MfMGenericElement"
import { MfMOptionsParser } from "../options/MfMOptions"
import { isEmpty } from "../../parser/find"
import { Parser } from "../../parser/Parser"
import { Parsers } from "../../parser/Parsers"
import { ContentUpdate } from "src/ContentUpdate"
import { isWhitespace } from "../../parser/isWhitespace"

export type MfMParagraphContent = MfMContentLine
export class MfMParagraph extends MfMGenericBlock<MfMParagraph, MfMParagraphContent, 'paragraph', MfMParagraphParser> implements Paragraph<MfMParagraph, MfMParagraphContent> {
	constructor(id: string, pw: MfMParagraphParser) { super(id, 'paragraph', pw) }
}

export class MfMParagraphParser extends Parser<MfMParagraph, MfMParagraph, MfMContentLineParser | MfMOptionsParser> {
	public readonly elementName = 'MfMParagraph'

	parseLine(previous: MfMParagraph | null, text: string, start: number, length: number): MfMParagraph | null {
		const paragraph = previous? previous : new MfMParagraph(this.parsers.idGenerator.nextId(), this)

		if(isEmpty(text, start, length)) {
			paragraph.continueWithNextLine = false
			return null
		} else if(isStartOfToplevelBlock(paragraph, text, start, length, this.parsers)) {
			paragraph.continueWithNextLine = false
			return null
		}
		paragraph.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), paragraph))
		let i = this.parsers.MfMOptions.addOptionsTo(paragraph, text, start, length).parsedLength

		if(i < length) {
			const nextChar = text.charAt(start+i)
			if(i > 0 && (nextChar===' ' || nextChar==='\t')) { //TODO isWhitespace!
				paragraph.lines[paragraph.lines.length-1].content.push(new StringLineContent(nextChar, start+i, 1, paragraph))
				i++
			} else if(i === 0 && previous == null) {
				//On the first line (previous === null), remove up to three
				//whitespace characters, but only if there are no options
				//(i === 0)
				let spaces = 0
				while(isWhitespace(text.charAt(start+i+spaces))) {
					spaces++
				}
				if(spaces > 0 && spaces <= 3) {
					paragraph.lines[paragraph.lines.length-1].content.push(new StringLineContent(text.substring(start+i, start+i+spaces), start+i, spaces, paragraph))
					i+= spaces
				}
			}

			const textContent = this.parsers.MfMContentLine.parseLine(null, text, start+i, length-i)
			if(textContent != null) { paragraph.addContent(textContent) }
		}

		return paragraph
	}

	override shouldInterrupt(element: Element<unknown, unknown, unknown, unknown>, text: string, start: number, length: number): boolean {
		return false
	}

	override canUpdate(original: MfMParagraph, update: ContentUpdate, replacedText: string): boolean {
		for(let i=0; i<original.lines.length; i++) {
			const firstChar = original.lines[i].asText.charAt(0)
			switch(firstChar) {
				case '#': case '[': case '`': case '*': case '-': case '=': case '>': case '^': return false
			}
		}
		return super.canUpdate(original, update, replacedText)
	}
}

function isStartOfToplevelBlock(current: MfMParagraph, text: string, start: number, length: number, parsers: Parsers<never>) {
	for(let p of parsers.allBlocks??[]) {
		if(p.shouldInterrupt(current, text, start, length)) {
			return true
		}
	}
	return false
}
