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

import { LineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { Emphasis } from "$element/MarkdownElements";
import { MfMInlineElements } from "$markdown/MfMDialect";
import { InlineParser } from "$parser/Parser";

export interface DelimiterRun {
	start: number,
	length: number,
	character: string,
}

export class MfMEmphasis extends GenericInline<MfMEmphasis, MfMInlineElements, LineContent<MfMEmphasis>, 'emphasis', MfMEmphasisParser> implements Emphasis<MfMEmphasis, MfMInlineElements> {
	constructor(id: string, pw: MfMEmphasisParser) { super(id, 'emphasis', pw) }
}

const DELIMITERS = [ '*', '_', '~', ]
const PUNCTUATION = [ 
	'!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
	':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',
]
export abstract class MfMGenericEmphasisParser<
	T extends GenericInline<T, any, any, any, any>,
	P extends MfMGenericEmphasisParser<T, P>
> extends InlineParser<T> {
	parseInline(text: string, start: number, length: number): T | null {
		throw new Error("Method not implemented.");
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
			if(delimiterIndex >= start && delimiterIndex < start+length) {
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
}

export class MfMEmphasisParser extends MfMGenericEmphasisParser<MfMEmphasis, MfMEmphasisParser> {
	public readonly elementName = 'MfMEmphasis'
}
