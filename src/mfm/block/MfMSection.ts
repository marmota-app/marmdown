import { GenericBlock } from "$element/GenericElement"
import { Section } from "$element/MarkdownElements"
import { parseBlock } from "$parser/parse"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMHeading } from "./MfMHeading"
import { MfMParagraph } from "./MfMParagraph"

export type MfMSectionContent = MfMHeading | MfMParagraph | MfMSection
export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section', MfMSectionParser> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string, pw: MfMSectionParser, public readonly level: number = 1) { super(id, 'section', pw) }

	override get isFullyParsed() { return false }
}

export class MfMSectionParser extends Parser<MfMSection> {
	public readonly elementName = 'MfMSection'
	constructor(private parsers: Parsers<never>) { super() }

	create(level: number = 1) {
		return new MfMSection(this.parsers.idGenerator.nextId(), this, level)
	}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		const result = parseBlock<MfMSection, MfMSectionContent>(previous, text, start, length, this.create.bind(this), this.allBlocks, this.endsPrevious)

		return result
	}

	private endsPrevious(previous: MfMSection, content: MfMSectionContent) {
		if(content.type === 'section') {
			return content.level <= previous.level
		}
		return false
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }
}
