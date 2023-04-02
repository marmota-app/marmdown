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

import { ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Heading } from "$element/MarkdownElements"
import { MfMContentLine, MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMParser } from "$mfm/MfMParser"
import { EMPTY_OPTIONS, MfMOptions, MfMOptionsParser } from "$mfm/options/MfMOptions"
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
export class MfMHeadingParser extends MfMParser<
	MfMHeading, MfMSection,
	MfMOptionsParser | MfMContentLineParser | MfMSectionParser
> {
	public readonly elementName = 'MfMHeading'

	parseLine(previous: MfMHeading | null, text: string, start: number, length: number): MfMSection | null {
		let [ heading, i ] = this.useHeadingToParse(previous, text, start, length)
		const { skipAtEnd, continueWithNextLine, textAtEnd, } = this.hasContinuationEnd(text, start, length)

		if(heading) {
			i += this.parsers.MfMOptions.addOptionsTo(heading, text, start+i, length).parsedLength

			const { validSpace, skipSpaces, } = this.hasValidSpace(heading, text, start+i, length-i)
			if(validSpace) {
				i += skipSpaces

				const textContent = this.parsers.MfMContentLine.parseLine(null, text, start+i, length-i-skipAtEnd)
				if(textContent != null) {
					heading.addContent(textContent)
				}
				if(continueWithNextLine) { 
					heading.lines[heading.lines.length-1].content.push(new StringLineContent(textAtEnd, start+length-2, 2, heading))
				}
				heading.continueWithNextLine = continueWithNextLine

				return heading.section
			}
		}

		return null;
	}

	private useHeadingToParse(previous: MfMHeading | null, text: string, start: number, length: number): [ MfMHeading | null, number, ] {
		if(previous && !previous.isFullyParsed) {
			previous.lines.push(new ParsedLine(previous))
			return [ previous, 0 ]
		}

		for(let token of tokens) {
			if(text.indexOf(token, start) === start) {
				const section = this.parsers.MfMSection.create(token.length)
				const heading = new MfMHeading(this.parsers.idGenerator.nextId(), token.length, section, this)

				heading.lines.push(new ParsedLine(heading))
				heading.lines[0].content.push(new StringLineContent(token, start, token.length, heading))

				section.addContent(heading)

				return [ heading, token.length ]
			}
		}

		return [ null, 0 ]
	}

	private hasValidSpace(heading: MfMHeading, text: string, start: number, length: number): { validSpace: boolean, skipSpaces: number, } {
		let skipped = 0

		while(text.charAt(start+skipped) === ' ' || text.charAt(start+skipped) === '\t') {
			skipped++
		}
		if(skipped > 0) {
			const skippedText = text.substring(start, start+skipped)
			heading.lines[heading.lines.length-1].content.push(new StringLineContent(skippedText, start, skipped, heading))
			return { validSpace: true, skipSpaces: skipped, }
		}

		const isNthLineOfContinuedHeading = heading.lines.length > 1
		const isAtEndOfCurrentLine = length === 0
		if(isNthLineOfContinuedHeading || isAtEndOfCurrentLine) {
			return { validSpace: true, skipSpaces: 0, }
		}

		return { validSpace: false, skipSpaces: 0, }
	}

	override parseLineUpdate(original: MfMHeading, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
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
