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

import { ContainerInline, LineContent, ParsedLine, StringLineContent } from "$element/Element";
import { Emphasis, StrikeThrough, StrongEmphasis } from "$element/MarkdownElements";
import { MfMInlineElements } from "$markdown/MfMDialect";
import { finiteLoop } from "$markdown/finiteLoop";
import { MfMGenericContainerInline } from "$mfm/MfMGenericElement";
import { MfMOptionsParser } from "$mfm/options/MfMOptions";
import { InlineParser } from "$parser/Parser";
import { parseInnerInlineElement } from "$parser/parse";
import { MfMTextParser } from "./MfMText";

export interface DelimiterRun {
	start: number,
	length: number,
	character: string,
}

export class MfMEmphasis extends MfMGenericContainerInline<MfMEmphasis, MfMInlineElements, LineContent<MfMEmphasis>, 'emphasis', MfMEmphasisParser> implements Emphasis<MfMEmphasis, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'emphasis', pw) }
}
export class MfMStrongEmphasis extends MfMGenericContainerInline<MfMStrongEmphasis, MfMInlineElements, LineContent<MfMStrongEmphasis>, 'strong', MfMEmphasisParser> implements StrongEmphasis<MfMStrongEmphasis, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'strong', pw) }
}
export class MfMStrikeThrough extends MfMGenericContainerInline<MfMStrikeThrough, MfMInlineElements, LineContent<MfMStrikeThrough>, 'strike-through', MfMEmphasisParser> implements StrikeThrough<MfMStrikeThrough, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'strike-through', pw) }
}
export class TextSpan extends MfMGenericContainerInline<TextSpan, MfMInlineElements, LineContent<TextSpan>, '--text-span--', MfMEmphasisParser> implements ContainerInline<TextSpan, MfMInlineElements, '--text-span--'> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, '--text-span--', pw) }
}

const DELIMITERS = [ '*', '_', '~', ]
const PUNCTUATION = [ 
	'!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
	':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',
]
export class MfMEmphasisParser extends InlineParser<MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan, MfMOptionsParser | MfMTextParser> {
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
	parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan | null {
		const nextLeftRun = this.findLeftDelimiterRun(text, start, length)
		let i=0
		const foundContents: MfMInlineElements[] = []

		if(nextLeftRun != null && nextLeftRun.start === start) {
			let elementToCreate: typeof MfMEmphasis | typeof MfMStrongEmphasis | typeof MfMStrikeThrough | null = null
			let openingDelimiter: string | null = null
			if(nextLeftRun.character === '~') {
				//Here, we are incompatible with GfM: MfM treats tilde characters
				//in exactly the same way as _ and *, and thus allows more than
				//two tildes.
				elementToCreate = MfMStrikeThrough
				if(nextLeftRun.length % 2 === 0) {
					openingDelimiter = `${nextLeftRun.character}${nextLeftRun.character}`
					i += 2
				} else {
					openingDelimiter = nextLeftRun.character
					i += 1
				}
			} else {
				if(nextLeftRun.length % 2 === 0) {
					elementToCreate = MfMStrongEmphasis
					openingDelimiter = `${nextLeftRun.character}${nextLeftRun.character}`
					i += 2
				} else {
					elementToCreate = MfMEmphasis
					openingDelimiter = nextLeftRun.character
					i += 1
				}
			}

			const options = this.parsers.MfMOptions.parseLine(null, text, start+i, length-i)
			if(options) {
				const optionsLine = options.lines[options.lines.length-1]
				i += optionsLine.length
				const charAfterOptions = text.charAt(start+i)
				if(charAfterOptions === ' ' || charAfterOptions === '\t') {
					optionsLine.content.push(new StringLineContent(charAfterOptions, start+i, i, options))
					i++
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
					nextRightDelimiterRun = this.findRightDelimiterRun(text, start, start+i, length-i)
					if(nextRightDelimiterRun && nextRightDelimiterRun.start === start+i) {
						if(nextRightDelimiterRun.character===nextLeftRun.character && nextRightDelimiterRun.length >= openingDelimiter.length) {
							endsCurrent = true
						} else if(additionalParams.endsOuter?.(nextRightDelimiterRun)) {
							nextRightDelimiterRun = null
							endsCurrent = true
						} else {
							nextRightDelimiterRun = null
						}
					}
	
					if(endsCurrent) {
						if(textLength > 0) {
							const textContent = this.parsers.MfMText.parseLine(null, text, textStart, textLength)
							if(textContent) { foundContents.push(textContent) }
						}
						textLength = 0
						break
					} else {
						const additionalParametersForInner = {
							...additionalParams,
							endsOuter: (rightDelimiterRun: DelimiterRun) => {
								const endsMyOuter = additionalParams.endsOuter
								if(openingDelimiter && rightDelimiterRun.character===nextLeftRun.character && rightDelimiterRun.length >= openingDelimiter.length) {
									return true
								}
								return endsMyOuter?.(rightDelimiterRun) ?? false
							}
						}
						const innerElement = parseInnerInlineElement<MfMInlineElements>(text, start+i, length-i, this.parsers, additionalParametersForInner)
						if(innerElement != null) {
							if(textLength > 0) {
								const textContent = this.parsers.MfMText.parseLine(null, text, textStart, textLength)
								if(textContent) { foundContents.push(textContent) }
							}
							textLength = 0

							foundContents.push(innerElement)
							i += innerElement.lines[innerElement.lines.length-1].length
							textStart = start+i
							continue;
						}
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
				if(textContent) { foundContents.push(textContent) }
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
				if(openingDelimiter) {
					const delimiterText = this.parsers.MfMText.parseLine(null, text, nextLeftRun.start, nextLeftRun.length, additionalParams)
					if(delimiterText != null) {
						content.addContent(delimiterText)
						openingDelimiter = null
					}
				}
			}

			//Add delimiters as line content
			if(openingDelimiter) { content.lines[content.lines.length-1].content.push(new StringLineContent(openingDelimiter, nextLeftRun.start, openingDelimiter.length, content)) }
			if(options) { content.lines[content.lines.length-1].content.push(options.lines[options.lines.length-1]) }
			foundContents.forEach(c => content?.addContent(c))
			if(closingLineContent) { content.lines[content.lines.length-1].content.push(closingLineContent) }

			return content
		}

		return null
	}

	findNext(text: string, start: number, length: number): number | null {
		return this.findLeftDelimiterRun(text, start, length)?.start ?? null
	}
	findLeftDelimiterRun(text: string, searchStart: number, length: number): DelimiterRun | null {
		//Left-flanking delimiter runs are always searched from the start of
		//the line.
		const textStart = searchStart

		return this.findDelimiterRun(text, searchStart, length, (earliestDelimiterIndex: number, delimiterLength: number) => {
			const nextChar = text.charAt(earliestDelimiterIndex+delimiterLength)
			//No whitespace allowed after a left-flanking delimiter run
			//BUT '\\' and '{' are allowed here: We need to support options on
			//    all delimiter runs, hence '{' is allowed. But we must also
			//    be able to escape the options character, so '\\' must also
			//    be allowed.
			if(nextChar === ' ' || nextChar === '\t' || earliestDelimiterIndex+delimiterLength >= searchStart+length) { return false}
			//No punctuation allowed after a left-flanking delimiter run...
			if(PUNCTUATION.filter(p => p!=='\\' && p!=='{').find(p => p===nextChar)) {
				//... when there is NO whitespace before the delimiter run
				//    (the start of the line counts as whitespace)
				const charBefore = text.charAt(earliestDelimiterIndex-1)
				if(earliestDelimiterIndex !== textStart && charBefore !== ' ' && charBefore !== '\t') { return false }
			}
			return true
		})
	}
	findRightDelimiterRun(text: string, textStart: number, searchStart: number, searchLength: number): DelimiterRun | null {
		return this.findDelimiterRun(text, searchStart, searchLength, (earliestDelimiterIndex: number, delimiterLength: number) => {
			const currentChar = text.charAt(earliestDelimiterIndex)

			//Find the character before the current delimiter run, considering:
			// - The search might have started inside the delimiter run
			// - We must not extend the search beyond the start of the text
			//Also find the real start index of the delimiter run, that is,
			//the index where the current sequence of delimiter characters
			//begins (needed later for determining whether the current run
			//begins at the start of the line).
			let i=1
			let realDelimiterStartIndex = earliestDelimiterIndex
			let previousChar = text.charAt(earliestDelimiterIndex - i)
			while(realDelimiterStartIndex > textStart && previousChar === currentChar) {
				i++
				realDelimiterStartIndex--
				if(earliestDelimiterIndex-i >= textStart) {
					previousChar = text.charAt(earliestDelimiterIndex - i)
				}
			}

			//No whitespace allowed before a right-flanking delimiter run
			//The beginning of the line counts as whitespace!
			if(realDelimiterStartIndex === textStart || previousChar === ' ' || previousChar === '\t') { return false}
			//No punctuation allowed before a right-flanking delimiter run...
			if(PUNCTUATION.find(p => p===previousChar)) {
				//... when there is NO whitespace or punctuation character
				//    after the delimiter run.
				//    But: The end of the line counts as whitespace!
				const charAfter = text.charAt(earliestDelimiterIndex+delimiterLength)
				const isNotAtEndOfLine = (earliestDelimiterIndex+delimiterLength) !== (searchStart+searchLength)
				if(charAfter !== ' ' && charAfter !== '\t' && !PUNCTUATION.find(p => p===charAfter) && isNotAtEndOfLine) {
					return false 
				}
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
