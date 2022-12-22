import { GenericBlock } from "$element/GenericElement"
import { Heading } from "$element/MarkdownElements"
import { MfMText } from "$mfm/inline/MfMText"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMSection, MfMSectionParser } from "./MfMSection"

export type MfMHeadingContent = MfMText
export class MfMHeading extends GenericBlock<MfMHeading, MfMHeadingContent, 'heading'> implements Heading<MfMHeading, MfMHeadingContent> {
	constructor(id: string) { super(id, 'heading') }
}

export const tokens = [ '######', '#####', '####', '###', '##', '#', ]
export class MfMHeadingParser implements Parser<MfMHeading, MfMSection> {
	public readonly elementName = 'MfMHeading'
	constructor(private parsers: Parsers<MfMSectionParser>) {}

	parseLine(previous: MfMHeading | null, text: string, start: number, length: number): MfMSection | null {
		for(let token of tokens) {
			if(text.indexOf(`${token} `, start) === start) { //TODO generic find function?
				const section = this.parsers.MfMSection.create()
				section.level = token.length
				return section
			}
		}
		return null
	}
}
