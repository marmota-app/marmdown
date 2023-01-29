import { ParsedLine } from "$element/Element"
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

	create(level: number = 1) {
		return new MfMSection(this.parsers.idGenerator.nextId(), this, level)
	}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		const result = parseBlock<MfMSection, MfMSectionContent>(previous, text, start, length, this.create.bind(this), this.allBlocks, this.endsPrevious)

		return result
	}

	override parseLineUpdate(original: MfMSection, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		//A section cannot be updated directly, only its contents can be updated.
		//When an update bubbles up to this point, it is better to re-parse the
		//whole document (or at least to re-parse the container that contains
		//this section), so the section parser returns null here.
		return null
	}

	private endsPrevious(previous: MfMSection, content: MfMSectionContent) {
		if(content.type === 'section') {
			return content.level <= previous.level
		}
		return false
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }
}
