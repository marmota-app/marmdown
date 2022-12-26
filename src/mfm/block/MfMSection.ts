import { GenericBlock } from "$element/GenericElement"
import { Section } from "$element/MarkdownElements"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMHeading } from "./MfMHeading"
import { MfMParagraph } from "./MfMParagraph"

export type MfMSectionContent = MfMHeading | MfMParagraph
export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section'> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string, public readonly level: number = 1) { super(id, 'section') }

	override get isFullyParsed() { return false }
}

export class MfMSectionParser implements Parser<MfMSection> {
	public readonly elementName = 'MfMSection'
	constructor(private parsers: Parsers<never>) {}

	create(level: number) {
		return new MfMSection(this.parsers.idGenerator.nextId(), level)
	}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		return null
	}
}