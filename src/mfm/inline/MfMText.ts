import { ParsedLine, StringLineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { Text } from "$element/MarkdownElements";
import { Parser } from "$parser/Parser";
import { Parsers } from "$parser/Parsers";

export class MfMText extends GenericInline<MfMText, never, StringLineContent<MfMText>, 'text', MfMTextParser> implements Text<MfMText> {
	constructor(id: string, pw: MfMTextParser) { super(id, 'text', pw) }

	get text() { return this.lines.length===1? this.lines[0].content.map(l => l.asText).join('') : '' }
}

export class MfMTextParser extends Parser<MfMText> {
	public readonly elementName = 'MfMText'

	parseLine(previous: MfMText | null, text: string, start: number, length: number): MfMText | null {
		const result = new MfMText(this.parsers.idGenerator.nextId(), this)

		result.lines.push(new ParsedLine(result))
		result.lines[0].content.push(new StringLineContent(text.substring(start, start+length), start, length, result))

		return result
	}
}
