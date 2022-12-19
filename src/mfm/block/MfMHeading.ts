import { GenericBlock } from "$element/GenericElement"
import { Heading } from "$element/MarkdownElements"
import { MfMText } from "$mfm/inline/MfMText"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"

export type MfMHeadingContent = MfMText
export class MfMHeading extends GenericBlock<MfMHeading, MfMHeadingContent, 'heading'> implements Heading<MfMHeading, MfMHeadingContent> {
	constructor(id: string) { super(id, 'heading') }
}

export class MfMHeadingParser implements Parser<MfMHeading> {
	public readonly elementName = 'MfMHeading'
	constructor(private parsers: Parsers<never>) {}

	parseLine(previous: MfMHeading | null, text: string, start: number, length: number): MfMHeading | null {
		return null
	}
}
