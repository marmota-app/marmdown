import { GenericBlock } from "$element/GenericElement"
import { Section } from "$element/MarkdownElements"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMParagraph } from "./MfMParagraph"

export type MfMSectionContent = MfMParagraph
export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section'> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string) { super(id, 'section') }

	level: number = 1
	
	override get isFullyParsed() { return false }
}

export class MfMSectionParser implements Parser<MfMSection> {
	public readonly elementName = 'MfMSection'
	constructor(private parsers: Parsers<never>) {}

	create() {
		return new MfMSection(this.parsers.idGenerator.nextId())
	}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		return null
	}
}