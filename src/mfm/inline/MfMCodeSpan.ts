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

import { Element, LineContent, ParsedLine, StringLineContent } from "../../element/Element";
import { CodeSpan } from "../../element/MarkdownElements";
import { ContentUpdate } from "../../ContentUpdate";
import { MfMGenericContainerInline } from "../MfMGenericElement";
import { MfMOptionsParser } from "../options/MfMOptions";
import { InlineParser } from "../../parser/Parser";
import { MfMText, MfMTextParser } from "./MfMText";

export class MfMCodeSpan extends MfMGenericContainerInline<MfMCodeSpan, MfMText, LineContent<MfMCodeSpan>, 'code-span', MfMCodeSpanParser> implements CodeSpan<MfMCodeSpan, MfMText> {
	constructor(id: string, pw: MfMCodeSpanParser) { super(id, 'code-span', pw) }
}

export class MfMCodeSpanParser extends InlineParser<MfMCodeSpan | MfMText, MfMTextParser | MfMOptionsParser> {
	public readonly elementName = 'MfMCodeSpan'

	override parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMCodeSpan | MfMText | null {
		if(text.charAt(start) === '`') {
			const openingDelimiter = this.findOpeningDelimiter(text, start, length)

			const closingIndex = this.findClosingDelimiter(openingDelimiter, text, start+openingDelimiter.length, length-openingDelimiter.length)
			if(closingIndex >= 0 && closingIndex < start+length) {
				const { stripSpaces, strip } = this.shouldStripSpaces(text, start, openingDelimiter.length, closingIndex)

				const codeSpan = new MfMCodeSpan(this.parsers.idGenerator.nextId(), this)

				codeSpan.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), codeSpan))
				codeSpan.lines[0].content.push(new StringLineContent(openingDelimiter, start, openingDelimiter.length, codeSpan))
				if(stripSpaces) { codeSpan.lines[0].content.push(new StringLineContent(' ', start+openingDelimiter.length, 1, codeSpan))}
				
				let optionsLength = 0
				const options = this.parsers.MfMOptions.parseLine(null, text, start+openingDelimiter.length, closingIndex - start - openingDelimiter.length)
				if(options && options.isFullyParsed) {
					codeSpan.lines[codeSpan.lines.length-1].content.push(options.lines[options.lines.length-1])

					optionsLength = options.lines[options.lines.length-1].length
					if(optionsLength > 0 && text.charAt(start+openingDelimiter.length+optionsLength)===' ') {
						codeSpan.lines[0].content.push(new StringLineContent(' ', start+openingDelimiter.length+optionsLength, 1, codeSpan))
						optionsLength++
					}
				}

				const textContent = this.parsers.MfMText.parseLine(
					null, text,
					start + openingDelimiter.length + strip + optionsLength,
					closingIndex - start - openingDelimiter.length - 2*strip - optionsLength
				)
				if(textContent != null) {
					codeSpan.addContent(textContent)
				}

				if(stripSpaces) { codeSpan.lines[0].content.push(new StringLineContent(' ', closingIndex-1, 1, codeSpan))}
				codeSpan.lines[0].content.push(new StringLineContent(openingDelimiter, closingIndex, openingDelimiter.length, codeSpan))
		
				return codeSpan
			} else {
				return this.parsers.MfMText.parseLine(null, text, start, openingDelimiter.length)
			}
		}
		return null
	}

	shouldStripSpaces(text: string, start: number, openingDelimiterLength: number, closingIndex: number) {
		const firstCharacterIsSpace = text.charAt(start+openingDelimiterLength) === ' '
		const lastCharacterIsSpace = text.charAt(closingIndex-1) === ' '
		let isOnlySpaces = true
		for(let i=start+openingDelimiterLength; i<closingIndex; i++) {
			if(text.charAt(i) !== ' ') {
				isOnlySpaces = false;
				break;
			}
		}
		const stripSpaces = firstCharacterIsSpace && lastCharacterIsSpace && !isOnlySpaces
		const strip = stripSpaces? 1 : 0

		return { stripSpaces, strip }
	}

	private findOpeningDelimiter(text: string, start: number, length: number) {
		let delimiterLength = 0

		while(delimiterLength < length && text.charAt(start+delimiterLength) === '`') {
			delimiterLength++
		}

		return text.substring(start, start+delimiterLength)
	}

	private findClosingDelimiter(openingDelimiter: string, text: string, start: number, length: number): number {
		const nextDelimiterCharacterIndex = text.indexOf('`', start)
		if(nextDelimiterCharacterIndex >= 0 && nextDelimiterCharacterIndex < start+length) {
			for(let i=0; i<openingDelimiter.length; i++) {
				if(text.charAt(nextDelimiterCharacterIndex+i) !== '`') { return this.findClosingDelimiter(openingDelimiter, text, start+nextDelimiterCharacterIndex+i, length-(nextDelimiterCharacterIndex+i-start)) }
			}
			//The lenght must match exactly, so, there must not be a '`' after the run!
			if(text.charAt(nextDelimiterCharacterIndex + openingDelimiter.length) === '`') { return this.findClosingDelimiter(openingDelimiter, text, start+nextDelimiterCharacterIndex+openingDelimiter.length, length-(nextDelimiterCharacterIndex+openingDelimiter.length-start)) }

			return nextDelimiterCharacterIndex
		}
		return -1
	}

	override canUpdate(original: MfMCodeSpan | MfMText, update: ContentUpdate, replacedText: string): boolean {
		let isOnlySpaces = update.text.length > 0
		for(let i=0; i<update.text.length; i++) {
			if(update.text.charAt(i) !== ' ') {
				isOnlySpaces = false
				break
			}
		}

		return !isOnlySpaces && super.canUpdate(original, update, replacedText)
	}
}
