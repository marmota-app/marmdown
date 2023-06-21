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

import { Element, ParsedLine } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Paragraph } from "$element/MarkdownElements"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { isEmpty } from "$parser/find"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"

export type MfMParagraphContent = MfMContentLine
export class MfMParagraph extends GenericBlock<MfMParagraph, MfMParagraphContent, 'paragraph', MfMParagraphParser> implements Paragraph<MfMParagraph, MfMParagraphContent> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: MfMParagraphParser) { super(id, 'paragraph', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export class MfMParagraphParser extends Parser<MfMParagraph, MfMParagraph, MfMContentLineParser> {
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
		if(previous) {
			previous.lines.push(new ParsedLine(this.parsers.idGenerator.nextId(), previous))
		}

		const textContent = this.parsers.MfMContentLine.parseLine(null, text, start, length)
		if(textContent != null) { paragraph.addContent(textContent) }

		return paragraph
	}

	override shouldInterrupt(element: Element<unknown, unknown, unknown, unknown>, text: string, start: number, length: number): boolean {
		return false
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
