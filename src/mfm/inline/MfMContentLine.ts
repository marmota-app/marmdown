import { LineContent } from "$element/Element"
import { GenericInline } from "$element/GenericElement"
import { parseInlineContent } from "$parser/parse"
import { Parser } from "$parser/Parser"
import { MfMText } from "./MfMText"

export type MfMContentLineContent = MfMText //TODO actually, all container leaf elements are allowed here!
export class MfMContentLine extends GenericInline<MfMContentLine, MfMContentLineContent, LineContent<MfMContentLine>, 'content-line', MfMContentLineParser> {
	constructor(id: string, pw: MfMContentLineParser) { super(id, 'content-line', pw) }
}
/**
 * Parses the text content of a single line of the heading. 
 * 
 * Since heading content is always just a single line of the heading, even
 * for multi-line headings, there cannot ba a `previous` object when parsing
 * heading content.
 */
export class MfMContentLineParser extends Parser<MfMContentLine> {
	public readonly elementName = 'MfMContentLine'

	parseLine(previous: MfMContentLine | null, text: string, start: number, length: number): MfMContentLine | null {
		if(previous != null) { throw new Error(`Cannot parse ${text.substring(start, start+length)} at ${start} because there cannot be a previous MfMHeadingText when parsing heading content!`) }
		
		const textContent = new MfMContentLine(this.parsers.idGenerator.nextId(), this)

		parseInlineContent(text, start, length, textContent, this.parsers)

		return textContent
	}
}
