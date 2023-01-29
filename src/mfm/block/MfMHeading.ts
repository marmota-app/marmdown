import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock, GenericInline } from "$element/GenericElement"
import { Heading } from "$element/MarkdownElements"
import { ParseError } from "$markdown/LineByLineParser"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMText } from "$mfm/inline/MfMText"
import { parseInlineContent } from "$parser/parse"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMSection, MfMSectionParser } from "./MfMSection"

export type MfMHeadingContent = MfMContentLine
export class MfMHeading extends GenericBlock<MfMHeading, MfMHeadingContent, 'heading', MfMHeadingParser> implements Heading<MfMHeading, MfMHeadingContent> {
	continueWithNextLine: boolean = false
	constructor(id: string, public readonly level: number, public readonly section: MfMSection, pw: MfMHeadingParser) { super(id, 'heading', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export const tokens = [ '######', '#####', '####', '###', '##', '#', ]
export class MfMHeadingParser extends Parser<MfMHeading, MfMSection> {
	public readonly elementName = 'MfMHeading'

	parseLine(previous: MfMHeading | null, text: string, start: number, length: number): MfMSection | null {
		const { skipAtEnd, continueWithNextLine, } = this.hasContinuationEnd(text, start, length)

		let i=0
		if(previous != null && !previous.isFullyParsed) {
			const textContent = (this.parsers.MfMContentLine as MfMContentLineParser).parseLine(null, text, start+i, length-i-skipAtEnd)
			if(textContent != null) {
				//TODO can we generalize adding a new line? it's always 
				//     necessary when there is a previous element. But
				//     generalizing might be hard, because there is no other
				//     part of the system that knows it's necessary except
				//     every individual parser.
				previous.lines.push(new ParsedLine(previous))
				previous.addContent(textContent)
				if(continueWithNextLine) { 
					previous.lines[previous.lines.length-1].content.push(new StringLineContent('  ', start+length-2, 2, previous))
				}
				previous.continueWithNextLine = continueWithNextLine
				return previous.section
			} else {
				previous.continueWithNextLine = false
			}
		} else {
			for(let token of tokens) {
				if(text.indexOf(`${token} `, start) === start) { //TODO generic find function?
					//FIXME duplication `${token} ` -- could be fixed with generic find function, maybe.
					i += `${token} `.length

					const section = (this.parsers.MfMSection as MfMSectionParser).create(token.length)

					const heading = new MfMHeading(this.parsers.idGenerator.nextId(), token.length, section, this)
					heading.continueWithNextLine = continueWithNextLine
					heading.lines.push(new ParsedLine(heading))
					heading.lines[0].content.push(new StringLineContent(`${token} `, start, i, heading))

					section.addContent(heading)

					const textContent = (this.parsers.MfMContentLine as MfMContentLineParser).parseLine(null, text, start+i, length-i-skipAtEnd)
					if(textContent != null) { heading.addContent(textContent) }
					
					if(continueWithNextLine) { 
						heading.lines[heading.lines.length-1].content.push(new StringLineContent('  ', start+length-2, 2, heading))
					}
	
					return section
				}
			}
		}
		return null
	}

	parseLineUpdate(original: MfMHeading, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		const result = this.parseLine(null, text, start, length)
		if(result && result.level === original.level) {
			return result.lines[0]
		}
		return null
	}

	private hasContinuationEnd(text: string, start: number, length: number) {
		if(length>=2 && text.charAt(start+length-2)===' ' && text.charAt(start+length-1)===' ') {
			return {
				continueWithNextLine: true,
				skipAtEnd: 2,
			}
		}

		return {
			continueWithNextLine: false,
			skipAtEnd: 0,
		}
	}
}
