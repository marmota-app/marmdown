import { StringLineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { Text } from "$element/MarkdownElements";
import { Parser } from "$parser/Parser";
import { Parsers } from "$parser/Parsers";

export class MfMText extends GenericInline<MfMText, never, StringLineContent<MfMText>, 'text'> implements Text<MfMText> {
	constructor(id: string) { super(id, 'text') }

	readonly text: string = ''
}

export class MfMTextParser implements Parser<MfMText> {
	public readonly elementName = 'MfMText'
	constructor(private parsers: Parsers<never>) {}

	parseLine(previous: MfMText | null, text: string, start: number, length: number): MfMText | null {
		return null
	}
}
