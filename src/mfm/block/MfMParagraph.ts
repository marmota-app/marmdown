import { Element, ParsedLine } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Paragraph } from "$element/MarkdownElements"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
import { isEmpty } from "$parser/find"
import { parseInlineContent } from "$parser/parse"
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

export class MfMParagraphParser extends Parser<MfMParagraph> {
	public readonly elementName = 'MfMParagraph'

	parseLine(previous: MfMParagraph | null, text: string, start: number, length: number): MfMParagraph | null {
		if(previous) {
			previous.lines.push(new ParsedLine(previous))
		}
		const paragraph = previous? previous : new MfMParagraph(this.parsers.idGenerator.nextId(), this)

		if(isEmpty(text, start, length)) {
			paragraph.continueWithNextLine = false
			return null
		} else if(isStartOfToplevelBlock(paragraph, text, start, length, this.parsers)) {
			paragraph.continueWithNextLine = false
			return null
		}

		const textContent = (this.parsers.MfMContentLine as MfMContentLineParser).parseLine(null, text, start, length)
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
