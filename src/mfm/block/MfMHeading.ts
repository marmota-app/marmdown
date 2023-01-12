import { LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock, GenericInline } from "$element/GenericElement"
import { Heading } from "$element/MarkdownElements"
import { MfMText } from "$mfm/inline/MfMText"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMSection, MfMSectionParser } from "./MfMSection"

export type MfMHeadingContent = MfMHeadingText
export class MfMHeading extends GenericBlock<MfMHeading, MfMHeadingContent, 'heading', MfMHeadingParser> implements Heading<MfMHeading, MfMHeadingContent> {
	constructor(id: string, public readonly level: number, pw: MfMHeadingParser) { super(id, 'heading', pw) }
}

export const tokens = [ '######', '#####', '####', '###', '##', '#', ]
export class MfMHeadingParser implements Parser<MfMHeading, MfMSection> {
	public readonly elementName = 'MfMHeading'
	constructor(private parsers: Parsers<MfMSectionParser | MfMHeadingTextParser>) {}

	parseLine(previous: MfMHeading | null, text: string, start: number, length: number): MfMSection | null {
		let i=0
		for(let token of tokens) {
			//FIXME duplication `${token} ` -- could be fixed with generic find function, maybe.
			if(text.indexOf(`${token} `, start) === start) { //TODO generic find function?
				i += `${token} `.length

				const section = (this.parsers.MfMSection as MfMSectionParser).create(token.length)

				const heading = new MfMHeading(this.parsers.idGenerator.nextId(), token.length, this)
				heading.lines.push(new ParsedLine(heading))
				heading.lines[0].content.push(new StringLineContent(`${token} `, start, i, heading))

				section.addContent(heading)

				const textContent = (this.parsers.MfMHeadingText as MfMHeadingTextParser).parseLine(null, text, start+i, length-i)
				if(textContent != null) { heading.addContent(textContent) }

				return section
			}
		}
		return null
	}
}

export type MfMHeadingTextContent = MfMText //TODO actually, all container leaf elements are allowed here!
export class MfMHeadingText extends GenericInline<MfMHeadingText, MfMHeadingTextContent, LineContent<MfMHeadingText>, 'heading-text', MfMHeadingTextParser> {
	constructor(id: string, pw: MfMHeadingTextParser) { super(id, 'heading-text', pw) }
}
export class MfMHeadingTextParser implements Parser<MfMHeadingText> {
	public readonly elementName = 'MfMHeadingText'
	constructor(private parsers: Parsers<never>) {}

	parseLine(previous: MfMHeadingText | null, text: string, start: number, length: number): MfMHeadingText | null {
		//TODO can there be a `previous`?
		if(!this.parsers.allInlines) { throw new Error(`Cannot parse ${text.substring(start, start+length)} at ${start} because all inline parsers array is not defined`) }
		
		const textContent = new MfMHeadingText(this.parsers.idGenerator.nextId(), this)

		let i=0
		while(i < length) {
			let contentParsed = false
			for(let p=0; p < this.parsers.allInlines.length; p++) {
				const parser = this.parsers.allInlines[p]
				const parsed = parser.parseLine(null, text, start+i, length-i)
				if(parsed) {
					i = length //TODO get parsed length from last parsed line!
					contentParsed = true
					textContent.addContent(parsed as any) //TODO all container elements should be allowed here, but we need support in allInlines for that!
					break
				}
			}
			if(!contentParsed) {
				//TODO throw error? can this even happen?
				return null
			}
		}

		return textContent
	}
}
