import { GenericBlock } from "$element/GenericElement"
import { Section } from "$element/MarkdownElements"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMParagraph } from "./MfMParagraph"

export type MfMSectionContent = MfMParagraph
export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section'> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string) { super(id, 'section') }
}

export class MfMSectionParser implements Parser<MfMSection> {
	public readonly elementName = 'MfMSection'
	constructor(private parsers: Parsers<never>) {}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		return null
	}
}