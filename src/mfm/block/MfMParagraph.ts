import { GenericBlock } from "$element/GenericElement"
import { Paragraph } from "$element/MarkdownElements"
import { MfMText } from "$mfm/inline/MfMText"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"

export type MfMParagraphContent = MfMText
export class MfMParagraph extends GenericBlock<MfMParagraph, MfMParagraphContent, 'paragraph'> implements Paragraph<MfMParagraph, MfMParagraphContent> {
	constructor(id: string) { super(id, 'paragraph') }
}

export class MfMParagraphParser implements Parser<MfMParagraph> {
	public readonly elementName = 'MfMParagraph'
	constructor(private parsers: Parsers<never>) {}

	parseLine(previous: MfMParagraph | null, text: string, start: number, length: number): MfMParagraph | null {
		return null
	}
}
