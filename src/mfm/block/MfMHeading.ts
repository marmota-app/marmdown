/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock, GenericInline } from "$element/GenericElement"
import { Heading } from "$element/MarkdownElements"
import { ParseError } from "$markdown/LineByLineParser"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMText } from "$mfm/inline/MfMText"
import { EMPTY_OPTIONS, MfMOptions, MfMOptionsParser, Options } from "$mfm/options/MfMOptions"
import { parseInlineContent } from "$parser/parse"
import { Parser } from "$parser/Parser"
import { Parsers } from "$parser/Parsers"
import { MfMSection, MfMSectionParser } from "./MfMSection"

export type MfMHeadingContent = MfMContentLine
export class MfMHeading extends GenericBlock<MfMHeading, MfMHeadingContent, 'heading', MfMHeadingParser> implements Heading<MfMHeading, MfMHeadingContent> {
	continueWithNextLine: boolean = false
	constructor(id: string, public readonly level: number, public readonly section: MfMSection, pw: MfMHeadingParser) { super(id, 'heading', pw) }
	override get isFullyParsed(): boolean {
		return this.options.isFullyParsed? !this.continueWithNextLine : false
	}
	public get options(): MfMOptions { //FIXME return type should be options
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? EMPTY_OPTIONS
	}
}

export const tokens = [ '######', '#####', '####', '###', '##', '#', ]
export class MfMHeadingParser extends Parser<
	MfMHeading, MfMSection,
	MfMOptionsParser | MfMContentLineParser | MfMSectionParser
> {
	public readonly elementName = 'MfMHeading'

	parseLine(previous: MfMHeading | null, text: string, start: number, length: number): MfMSection | null {
		const { skipAtEnd, continueWithNextLine, textAtEnd, } = this.hasContinuationEnd(text, start, length)

		//TODO somehow, this code has become too complicated. Maybe I can
		//     factor parsing the optiosn out from here - but how? -> Check
		//     again when there are more examples of options parsing, so
		//     similarities are easier to see.
		let i=0
		if(previous != null && !previous.isFullyParsed) {
			previous.lines.push(new ParsedLine(previous))
			if(!previous.options.isFullyParsed) {
				const options = this.parsers.MfMOptions.parseLine(previous.options, text, start+i, length-i)
				if(options) {
					const lastOptionLine = options.lines[options.lines.length-1]
					previous.lines[previous.lines.length-1].content.push(lastOptionLine)
					i += lastOptionLine.length
				}
			}
			if(text.charAt(start+i) === ' ') {
				//TODO should we skipp all whitespace here?
				previous.lines[previous.lines.length-1].content.push(new StringLineContent(' ', start+i, 1, previous))
				i++
			}
			const textContent = this.parsers.MfMContentLine.parseLine(null, text, start+i, length-i-skipAtEnd)
			if(textContent != null) {
				previous.addContent(textContent)
				if(continueWithNextLine) { 
					previous.lines[previous.lines.length-1].content.push(new StringLineContent(textAtEnd, start+length-2, 2, previous))
				}
				previous.continueWithNextLine = continueWithNextLine
				return previous.section
			} else {
				previous.continueWithNextLine = false
			}
		} else {
			for(let token of tokens) {
				if(text.indexOf(token, start) === start) {
					i += token.length
					let options: Options = EMPTY_OPTIONS
					let lastOptionLine: LineContent<MfMOptions> | undefined = undefined
					if(text.charAt(start+i) === '{') {
						options = this.parsers.MfMOptions.parseLine(null, text, start+i, length-i) ?? EMPTY_OPTIONS
						lastOptionLine = options.lines[options.lines.length-1]
						i += lastOptionLine.length
					}

					if(text.charAt(start+i) === ' ' || options !== EMPTY_OPTIONS || i === length) {
						const section = this.parsers.MfMSection.create(token.length)

						const heading = new MfMHeading(this.parsers.idGenerator.nextId(), token.length, section, this)
						heading.continueWithNextLine = continueWithNextLine
						heading.lines.push(new ParsedLine(heading))
						heading.lines[0].content.push(new StringLineContent(token, start, token.length, heading))

						if(lastOptionLine) {
							heading.lines[heading.lines.length-1].content.push(lastOptionLine)
						}
						if(i < length && text.charAt(start+i) === ' ') {
							//TODO should we skipp all whitespace here?
							heading.lines[0].content.push(new StringLineContent(' ', start+i, 1, heading))
							i++
						}
	
						section.addContent(heading)
	
						const textContent = (this.parsers.MfMContentLine as MfMContentLineParser).parseLine(null, text, start+i, length-i-skipAtEnd)
						if(textContent != null) { heading.addContent(textContent) }
						
						if(continueWithNextLine) { 
							heading.lines[heading.lines.length-1].content.push(new StringLineContent(textAtEnd, start+length-2, 2, heading))
						}
		
						return section
					}
				}
			}
		}
		return null
	}

	override parseLineUpdate(original: MfMHeading, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		const result = this.parseLine(null, text, start, length)
		if(result && result.level === original.level) {
			return result.lines[0]
		}
		return null
	}

	//TODO Refactor: Should this be part of a base class for MfM Parsers? Probably!
	override canUpdate(original: MfMHeading): boolean {
		return original.options.isFullyParsed
	}

	private hasContinuationEnd(text: string, start: number, length: number) {
		if(length>=2 && text.charAt(start+length-2)===' ' && text.charAt(start+length-1)===' ') {
			return {
				continueWithNextLine: true,
				skipAtEnd: 2,
				textAtEnd: '  ',
			}
		}

		return {
			continueWithNextLine: false,
			skipAtEnd: 0,
			textAtEnd: '',
		}
	}
}
