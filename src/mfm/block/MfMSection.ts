import { GenericBlock } from "$element/GenericElement"
import { Section } from "$element/MarkdownElements"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMHeading } from "./MfMHeading"
import { MfMParagraph } from "./MfMParagraph"

export type MfMSectionContent = MfMHeading | MfMParagraph
export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section', MfMSectionParser> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string, pw: MfMSectionParser, public readonly level: number = 1) { super(id, 'section', pw) }

	override get isFullyParsed() { return false }
}

export class MfMSectionParser implements Parser<MfMSection> {
	public readonly elementName = 'MfMSection'
	constructor(private parsers: Parsers<never>) {}

	create(level: number) {
		return new MfMSection(this.parsers.idGenerator.nextId(), this, level)
	}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		return null
	}
}