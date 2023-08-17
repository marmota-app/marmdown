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

import { ContainerInline, LineContent, ParsedLine, StringLineContent } from "../../element/Element";
import { Emphasis, StrikeThrough, StrongEmphasis } from "../../element/MarkdownElements";
import { TextSpan, TextSpanParser } from "../../element/TextSpan";
import { MfMInlineElements } from "../../MfMDialect";
import { MfMGenericContainerInline } from "../MfMGenericElement";
import { MfMOptions, MfMOptionsParser } from "../options/MfMOptions";
import { InlineParser } from "../../parser/Parser";
import { isWhitespace } from "../../parser/isWhitespace";
import { parseInlineContent, parseInnerInlineElement } from "../../parser/parse";
import { MfMTextParser } from "./MfMText";

export interface DelimiterRun {
	start: number,
	length: number,
	character: string,

	runStart: number,
	runLength: number,
	isLeftFlanking: boolean,
	isRightFlanking: boolean,
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

const DELIMITERS = [ '*', '_', '~', ]
const PUNCTUATION = [ 
	'!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
	':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',
]
export class MfMEmphasisParser extends InlineParser<
	MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan<MfMInlineElements>,
	MfMOptionsParser | MfMTextParser | TextSpanParser
> {
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
	override parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan<MfMInlineElements> | null {
		const nextLeftRun = this.findLeftDelimiterRun(text, start, length)
		let i=0

		if(nextLeftRun != null && nextLeftRun.start === start && canOpenEmphasis(nextLeftRun, text)) {
			let { openingDelimiter, elementToCreate } = this.elementToCreate(nextLeftRun, v => i+=v)
			const options = this.parseOptions(text, start+i, length-i, v => i+=v)

			let currentWasClosed = false
			let closingIndex = 0
			const endsCurrent = (searchIndex: number) => {
				const nextRightDelimiterRun = this.findRightDelimiterRun(text, searchIndex, length-(searchIndex-start))
				if(openingDelimiter && nextRightDelimiterRun && nextRightDelimiterRun.start === searchIndex) {
					if(nextRightDelimiterRun.character===nextLeftRun.character && nextRightDelimiterRun.length >= openingDelimiter.length && nextRightDelimiterRun.runStart!==nextLeftRun.runStart && canCloseEmphasis(nextRightDelimiterRun, text)) {
						currentWasClosed = true
						closingIndex = searchIndex
						return { ended: true, nextRightDelimiterRun, }
					}
					return { ended: false, nextRightDelimiterRun, }
				}
				return { ended: false, }
			}
			const endsOuter = (searchIndex: number, delimiting: { nextRightDelimiterRun?: DelimiterRun }) => {
				const endsMyOuter = additionalParams.endsOuter
				if(openingDelimiter && delimiting.nextRightDelimiterRun && delimiting.nextRightDelimiterRun.character===nextLeftRun.character && delimiting.nextRightDelimiterRun.length >= openingDelimiter.length && delimiting.nextRightDelimiterRun.runStart!==nextLeftRun.runStart && canCloseEmphasis(delimiting.nextRightDelimiterRun, text)) {
					return true
				}
				return endsMyOuter?.(searchIndex, delimiting) ?? false
			}
			const additionalParametersForInner = {
				...additionalParams,
				endsCurrent,
				endsOuter,
			}
			const foundContents: MfMInlineElements[] = parseInlineContent<MfMInlineElements>(
				text, start+i, length-i, this.parsers, additionalParametersForInner
			)

			return this.createContentElement(
				elementToCreate, foundContents, options,
				text, nextLeftRun, openingDelimiter,
				currentWasClosed, closingIndex, additionalParams
			)
		}

		return null
	}

	private elementToCreate(nextLeftRun: DelimiterRun, increment: (v: number)=>unknown) {
		let elementToCreate: typeof MfMEmphasis | typeof MfMStrongEmphasis | typeof MfMStrikeThrough | null = null
		let openingDelimiter: string | null = null
		if(nextLeftRun.character === '~') {
			//Here, we are incompatible with GfM: MfM treats tilde characters
			//in exactly the same way as _ and *, and thus allows more than
			//two tildes.
			elementToCreate = MfMStrikeThrough
			if(nextLeftRun.length % 2 === 0) {
				openingDelimiter = `${nextLeftRun.character}${nextLeftRun.character}`
				increment(2)
			} else {
				openingDelimiter = nextLeftRun.character
				increment(1)
			}
		} else {
			if(nextLeftRun.length % 2 === 0) {
				elementToCreate = MfMStrongEmphasis
				openingDelimiter = `${nextLeftRun.character}${nextLeftRun.character}`
				increment(2)
			} else {
				elementToCreate = MfMEmphasis
				openingDelimiter = nextLeftRun.character
				increment(1)
			}
		}
		return { openingDelimiter, elementToCreate }
	}

	private parseOptions(text: string, start: number, length: number, increment: (v: number)=>unknown) {
		let i=0

		const options = this.parsers.MfMOptions.parseLine(null, text, start+i, length-i)
		if(options && options.isFullyParsed) {
			const optionsLine = options.lines[options.lines.length-1]
			i += optionsLine.length
			increment(optionsLine.length)

			const charAfterOptions = text.charAt(start+i)
			if(charAfterOptions === ' ' || charAfterOptions === '\t') {
				optionsLine.content.push(new StringLineContent(charAfterOptions, start+i, i, options))
				i++
				increment(1)
			}
			return options
		}
		return null
	}

	private createContentElement(
		elementToCreate: typeof MfMEmphasis | typeof MfMStrongEmphasis | typeof MfMStrikeThrough,
		foundContents: MfMInlineElements[], options: MfMOptions | null,
		text: string, nextLeftRun: DelimiterRun, openingDelimiter: string,
		currentWasClosed: boolean, closingIndex: number, additionalParams: { [key: string]: any },
	) {
		//Create correct return value
		let content: MfMEmphasis | MfMStrongEmphasis | MfMStrikeThrough | TextSpan<MfMInlineElements> | null = null
		let closingLineContent: StringLineContent<any> | null = null
		if(currentWasClosed) {
			content = new elementToCreate(this.parsers.idGenerator.nextId(), this)
			const line: any = new ParsedLine(this.parsers.idGenerator.nextLineId(), content)
			content.lines.push(line)
			closingLineContent = new StringLineContent(openingDelimiter, closingIndex, openingDelimiter.length, content)

			//Add opening delimiter
			content.lines[content.lines.length-1].content.push(new StringLineContent(openingDelimiter, nextLeftRun.start, openingDelimiter.length, content))
		} else {
			content = this.parsers.TextSpan.create()
			content.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), content))
			if(openingDelimiter) {
				const delimiterText = this.parsers.MfMText.parseLine(null, text, nextLeftRun.start, openingDelimiter.length, additionalParams)
				if(delimiterText != null) {
					content.addContent(delimiterText)
				}
			}
		}

		//Add rest of the content
		if(options) { content.lines[content.lines.length-1].content.push(options.lines[options.lines.length-1]) }
		foundContents.forEach(c => content?.addContent(c))
		if(closingLineContent) { content.lines[content.lines.length-1].content.push(closingLineContent) }

		return content
	}

	findLeftDelimiterRun(text: string, searchStart: number, length: number): DelimiterRun | null {
		return this.findDelimiterRun(text, searchStart, length, this.isLeftFlanking)
	}
	findRightDelimiterRun(text: string, searchStart: number, searchLength: number): DelimiterRun | null {
		return this.findDelimiterRun(text, searchStart, searchLength, this.isRightFlanking)
	}

	private findDelimiterRun(
		text: string, start: number, length: number,
		isValid: (text: string, delimiter: string, start: number, length: number, runStart: number, runLength: number) => boolean
	): DelimiterRun | null {
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
			let runStart = earliestDelimiter.index
			let runLength = delimiterLength

			while(runStart>0 && text.charAt(runStart-1)===earliestDelimiter.delimiter) {
				runStart--
				runLength++
			}

			if(isValid(text, earliestDelimiter.delimiter, earliestDelimiter.index, delimiterLength, runStart, runLength)) {
				return {
					character: earliestDelimiter.delimiter,
					start: earliestDelimiter.index,
					length: delimiterLength,

					runStart,
					runLength,
					isLeftFlanking: this.isLeftFlanking(text, earliestDelimiter.delimiter, earliestDelimiter.index, delimiterLength, runStart, runLength),
					isRightFlanking: this.isRightFlanking(text, earliestDelimiter.delimiter, earliestDelimiter.index, delimiterLength, runStart, runLength),
				}
			}
		}
		return null
	}

	private isLeftFlanking(text: string, delimiter: string, start: number, length: number, runStart: number, runLength: number) {
		const nextChar = text.charAt(start+length)
		//No whitespace allowed after a left-flanking delimiter run
		if(isWhitespace(nextChar) || isEndOfLine(nextChar)) { return false}
		//No punctuation allowed after a left-flanking delimiter run...
		//BUT '\\' and '{' are allowed here: We need to support options on
		//    all delimiter runs, hence '{' is allowed. But we must also
		//    be able to escape the options character, so '\\' must also
		//    be allowed.
		if(PUNCTUATION.filter(p => p!=='\\' && p!=='{').find(p => p===nextChar)) {
			//... when there is NO whitespace OR punctuation before the
			//    delimiter run
			//    (the start of the line counts as whitespace)
			const charBefore = text.charAt(runStart-1)
			if(runStart !== 0 && !isWhitespace(charBefore) && !PUNCTUATION.find(p => p===charBefore)) { return false }
		}
		return true
	}

	private isRightFlanking(text: string, delimiter: string, start: number, length: number, runStart: number, runLength: number) {
		const previousChar = text.charAt(runStart - 1)

		//No whitespace allowed before a right-flanking delimiter run
		//The beginning of the line counts as whitespace!
		if(isWhitespace(previousChar) || isBeginningOfLine(previousChar, runStart)) { return false}
		//No punctuation allowed before a right-flanking delimiter run...
		if(PUNCTUATION.find(p => p===previousChar)) {
			//... when there is NO whitespace or punctuation character
			//    after the delimiter run.
			//    But: The end of the line counts as whitespace!
			const charAfter = text.charAt(start+length)
			if(!(isWhitespace(charAfter) || PUNCTUATION.find(p => p===charAfter) || isEndOfLine(charAfter))) {
				return false 
			}
		}
		return true
	}
}

function isBeginningOfLine(char: string, index: number) {
	return index===0 || char==='\r' || char==='\n'
}

function isEndOfLine(char: string) {
	return char === '\r' || char === '\n' || char === ''
}

function isFollowedByPunctuation(rightRun: DelimiterRun, text: string) {
	const next = text.charAt(rightRun.runStart + rightRun.runLength)
	return next==='' || (PUNCTUATION.find(p => p===next) != null)
}
function canCloseEmphasis(rightRun: DelimiterRun, text: string) {
	return rightRun.character !== '_' ||
		!rightRun.isLeftFlanking ||
		isFollowedByPunctuation(rightRun, text)
}

function isPrecededByPunctuation(leftRun: DelimiterRun, text: string) {
	const previous = text.charAt((leftRun?.runStart??0) - 1)
	return PUNCTUATION.find(p => p===previous) != null
}
function canOpenEmphasis(leftRun: DelimiterRun, text: string) {
	return leftRun.character !== '_' ||
		!leftRun.isRightFlanking ||
		isPrecededByPunctuation(leftRun, text)
}
