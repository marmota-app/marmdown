import { StringLineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { Text } from "$element/MarkdownElements";
import { Parser } from "$parser/Parser";
import { Parsers } from "$parser/Parsers";

export class MfMText extends GenericInline<MfMText, never, StringLineContent<MfMText>, 'text', MfMTextParser> implements Text<MfMText> {
	constructor(id: string, pw: MfMTextParser) { super(id, 'text', pw) }

	override get asText() { return this.lines.map(l => l.asText).join('') }
	get text() { return this.asText }
}

export class MfMTextParser implements Parser<MfMText> {
	public readonly elementName = 'MfMText'
	constructor(private parsers: Parsers<never>) {}

	parseLine(previous: MfMText | null, text: string, start: number, length: number): MfMText | null {
		const result = new MfMText(this.parsers.idGenerator.nextId(), this)

		result.lines.push(new StringLineContent(text, start, length, result))

		return result
	}
}
