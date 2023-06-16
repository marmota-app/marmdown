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

import { ContainerInline, Element, Inline, LineContent, ParsedLine, StringLineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { StrikeThrough } from "$element/MarkdownElements";
import { Emphasis, StrongEmphasis } from "$element/MarkdownElements";
import { MfMInlineElements } from "$markdown/MfMDialect";
import { finiteLoop } from "$markdown/finiteLoop";
import { InlineParser, Parser } from "$parser/Parser";

export interface DelimiterRun {
	start: number,
	length: number,
	character: string,
}

export class MfMEmphasis extends GenericInline<MfMEmphasis, MfMInlineElements, LineContent<MfMEmphasis>, 'emphasis', MfMEmphasisParser> implements Emphasis<MfMEmphasis, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'emphasis', pw) }
}
export class MfMStrongEmphasis extends GenericInline<MfMStrongEmphasis, MfMInlineElements, LineContent<MfMStrongEmphasis>, 'strong', MfMEmphasisParser> implements StrongEmphasis<MfMStrongEmphasis, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'strong', pw) }
}
export class MfMStrikeThrough extends GenericInline<MfMStrikeThrough, MfMInlineElements, LineContent<MfMStrikeThrough>, 'strike-through', MfMEmphasisParser> implements StrikeThrough<MfMStrikeThrough, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'strike-through', pw) }
}
export class TextSpan extends GenericInline<TextSpan, MfMInlineElements, LineContent<TextSpan>, '--text-span--', MfMEmphasisParser> implements ContainerInline<TextSpan, MfMInlineElements, '--text-span--'> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, '--text-span--', pw) }
}

const DELIMITERS = [ '*', '_', '~', ]
const PUNCTUATION = [ 
	'!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
	':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',
]
export class MfMEmphasisParser extends InlineParser<MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan> {
	public readonly elementName = 'MfMEmphasis'

	/**
	 * Parse an emphasis at the very start of the text. 
	 * 
	 * When parsing gets to the point where this method is called, the emphasis
	 * must be at the very start of the text. So, this parser can parse 
	 * 
	 * - everything up until the emphasis is closed and return the emphasis -or-
	 * - everything up until the end of the line and return a `TextSpan`
	 * 
	 * @param text The complete document text
	 * @param start The start index where parsing should begin
	 * @param length The maximum lenght that can be parsed at this point
	 */
	parseInline(text: string, start: number, length: number): MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan | null {
		const nextLeftRun = this.findLeftDelimiterRun(text, start, length)
		let i=0
		const foundContents: MfMInlineElements[] = []

		if(nextLeftRun != null && nextLeftRun.start === start) {
			let elementToCreate: typeof MfMEmphasis | typeof MfMStrongEmphasis | typeof MfMStrikeThrough | null = null
			let openingDelimiter: string | null = null
			if(nextLeftRun.character === '~') {
				elementToCreate = MfMStrikeThrough
				openingDelimiter = new Array(nextLeftRun.length).fill(nextLeftRun.character).join('')
				i += nextLeftRun.length
			} else {
				if(nextLeftRun.length === 2) {
					elementToCreate = MfMStrongEmphasis
					openingDelimiter = `${nextLeftRun.character}${nextLeftRun.character}`
					i += 2
				} else {
					elementToCreate = MfMEmphasis
					openingDelimiter = nextLeftRun.character
					i += 1
				}
			}
			
			const finite = finiteLoop(() => i)
			let textStart = start+i
			let textLength = 0
			let nextRightDelimiterRun: DelimiterRun | null = null
			while(i < length) {
				finite.guard()
				const currentChar = text.charAt(start+i)
				//Text content can - but doesn't have to - occur before each
				//inline content, and also at the very end (see below).
				//For each special character at this point, we must check
				//whether...
				// * it starts an inner inline element
				// * it ends the current element
				// * it belongs to the current text content
				if(this.isSpecialCharacter(currentChar)) {
					let endsCurrent = false
					nextRightDelimiterRun = this.findRightDelimiterRun(text, start+i, length-i)
					if(nextRightDelimiterRun && nextRightDelimiterRun.start === start+i) {
						if(nextRightDelimiterRun.character===nextLeftRun.character && nextRightDelimiterRun.length >= openingDelimiter.length) {
							endsCurrent = true
						} else {
							nextRightDelimiterRun = null
						}
					}
	
					if(endsCurrent) {
						if(textLength > 0) {
							const textContent = this.parsers.MfMText.parseLine(null, text, textStart, textLength)
							foundContents.push(textContent)
						}
						textLength = 0
						break
					//} else if(parseInlineElement(this.parsers.allInlines, text, start+i, length-i)) {
					}
				}
				i++
				textLength++
			}
			//Text content can occur at the very end (when there is no closing
			//delimiter, so we exited the loop without finding a right-flanking
			//delimiter run)
			if(textLength > 0) {
				const textContent = this.parsers.MfMText.parseLine(null, text, textStart, textLength)
				foundContents.push(textContent)
			}

			//Create correct return value
			let content: MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan | null = null
			let closingLineContent: StringLineContent<any> | null = null
			if(nextRightDelimiterRun?.start === (start+i)) {
				content = new elementToCreate(this.parsers.idGenerator.nextId(), this)
				const line: any = new ParsedLine(this.parsers.idGenerator.nextLineId(), content)
				content.lines.push(line)
				closingLineContent = new StringLineContent(openingDelimiter, nextRightDelimiterRun.start, openingDelimiter.length, content)
			} else {
				content = new TextSpan(this.parsers.idGenerator.nextId(), this)
				content.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), content))
			}

			//Add delimiters as line content
			if(openingDelimiter) { content.lines[content.lines.length-1].content.push(new StringLineContent(openingDelimiter, nextLeftRun.start, openingDelimiter.length, content)) }
			foundContents.forEach(c => content?.addContent(c))
			if(closingLineContent) { content.lines[content.lines.length-1].content.push(closingLineContent) }

			return content
		}

		return null
	}

	findNext(text: string, start: number, length: number): number | null {
		return this.findLeftDelimiterRun(text, start, length)?.start ?? null
	}
	findLeftDelimiterRun(text: string, start: number, length: number): DelimiterRun | null {
		return this.findDelimiterRun(text, start, length, (earliestDelimiterIndex: number, delimiterLength: number) => {
			const nextChar = text.charAt(earliestDelimiterIndex+delimiterLength)
			//No whitespace allowed after a left-flanking delimiter run
			if(nextChar === ' ' || nextChar === '\t' || earliestDelimiterIndex+delimiterLength >= start+length) { return false}
			//No punctuation allowed after a left-flanking delimiter run...
			if(PUNCTUATION.find(p => p===nextChar)) {
				//... when there is NO whitespace before the delimiter run
				const charBefore = text.charAt(earliestDelimiterIndex-1)
				if(charBefore !== ' ' && charBefore !== '\t') { return false }
			}
			return true
		})
	}
	findRightDelimiterRun(text: string, start: number, length: number): DelimiterRun | null {
		return this.findDelimiterRun(text, start, length, (earliestDelimiterIndex: number, delimiterLength: number) => {
			const previousChar = text.charAt(earliestDelimiterIndex - 1)
			//No whitespace allowed before a right-flanking delimiter run
			if(previousChar === ' ' || previousChar === '\t') { return false}
			//No punctuation allowed before a right-flanking delimiter run...
			if(PUNCTUATION.find(p => p===previousChar)) {
				//... when there is NO whitespace after the delimiter run
				const charAfter = text.charAt(earliestDelimiterIndex+delimiterLength)
				if(charAfter !== ' ' && charAfter !== '\t') { return false }
			}
			return true
		})
	}

	private findDelimiterRun(text: string, start: number, length: number, isValid: (earliestDelimiterIndex: number, delimiterLength: number) => boolean): DelimiterRun | null {
		const findDelimiter = (findStart: number) => (result: { index: number, delimiter: string}, delimiter: string): { index: number, delimiter: string} => {
			const delimiterIndex = text.indexOf(delimiter, findStart)
			if(delimiterIndex > 0 && text.charAt(delimiterIndex - 1) === '\\') {
				return findDelimiter(delimiterIndex+1)(result, delimiter)
			}
			if(delimiterIndex >= start && delimiterIndex < start+length && delimiterIndex < result.index) {
				result.delimiter = delimiter
				result.index = delimiterIndex
			}
			return result
		}

		const earliestDelimiter = DELIMITERS.reduce(findDelimiter(start), { index: Number.MAX_VALUE, delimiter: '--invalid--'})

		if(earliestDelimiter.delimiter !== '--invalid--') {
			let delimiterLength = 0
			for(let i=earliestDelimiter.index; i<start+length; i++) {
				if(text.charAt(i) !== earliestDelimiter.delimiter) {
					break
				}
				delimiterLength++
			}

			if(isValid(earliestDelimiter.index, delimiterLength)) {
				return { character: earliestDelimiter.delimiter, start: earliestDelimiter.index, length: delimiterLength }
			}
		}
		return null
	}

	private isSpecialCharacter(character: string) {
		switch(character) {
			case '_': case '*': case '~': return true
		}
		return false
	}
}

function parseInlineElement(parsers: Parser<MfMInlineElements>[], text: string, start: number, length: number) {

}
