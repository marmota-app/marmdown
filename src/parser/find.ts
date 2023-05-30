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

export function isEmpty(text: string, start: number, length: number) {
	if(length === 0) { return true }
	
	const searchRegex = new RegExp(/[ \t]*/, 'y')
	searchRegex.lastIndex = start

	const findResult = searchRegex.exec(text)

	return findResult && findResult[0].length === length
}

export interface FindResult {
	start: number, length: number,
	trimBefore?: string, trimBeforeStart?: number, trimBeforeLength?: number,
	found: string,       foundStart: number,       foundLength: number,
	trimAfter?: string,  trimAfterStart?: number,  trimAfterLength?: number,
	delimiter?: string,  delimiterStart?: number,  delimiterLength?: number,

	insertInto: <B extends Element<unknown, unknown, unknown, unknown>, T extends LineContent<B>> (line: ParsedLine<T | StringLineContent<B>, B>, belongsTo: B, onFound: (found: string, foundStart: number, foundLength: number) => T | null) => FindResult,
}
export function findTrimmed(text: string, delimiters: string[], start: number, length: number): FindResult {
	let delimiter: string | undefined
	let delimiterStart: number | undefined
	let delimiterLength: number | undefined
	
	if(delimiters.length === 1) {
		const until = delimiters[0]
		const delimiterIndex = text.indexOf(until, start)
		if(delimiterIndex >= 0 && delimiterIndex < start+length) {
			delimiter = until
			delimiterStart = delimiterIndex
			delimiterLength = until.length
		}
	} else if(delimiters.length > 1) {
		throw new Error('TODO: More than one delimiter is not yet supported!')
	}

	let trimBefore: string | undefined
	let trimBeforeStart: number | undefined
	let trimBeforeLength: number | undefined
	let trimmedStart = start
	while(text.charAt(trimmedStart) === ' ' || text.charAt(trimmedStart) === '\t') {
		trimBeforeStart = start
		trimBeforeLength = trimmedStart-start + 1
		if(trimBefore === undefined) {
			trimBefore = text.charAt(trimmedStart)
		} else {
			trimBefore += text.charAt(trimmedStart)
		}
		trimmedStart++
	}

	let trimAfter: string | undefined
	let trimAfterStart: number | undefined
	let trimAfterLength: number | undefined
	const contentEnd = delimiterStart!=null? delimiterStart : start+length
	let trimmedEnd = contentEnd-1
	while(text.charAt(trimmedEnd) === ' ' || text.charAt(trimmedEnd) === '\t') {
		trimAfterStart = trimmedEnd
		trimAfterLength = contentEnd-trimmedEnd
		if(trimAfter === undefined) {
			trimAfter = text.charAt(trimmedEnd)
		} else {
			trimAfter = text.charAt(trimmedEnd) + trimAfter
		}
		trimmedEnd--
	}
	
	const textStart = (trimBeforeStart!=null && trimBeforeLength!=null)? trimBeforeStart+trimBeforeLength: start
	const textEnd = trimAfterStart!=null? trimAfterStart : contentEnd
	const found = text.substring(textStart, textEnd)
	const foundStart = textStart
	const foundLength = textEnd - textStart

	return {
		start, length: (delimiterStart!=null && delimiterLength!=null)? delimiterStart-start+delimiterLength: length,
		trimBefore, trimBeforeStart, trimBeforeLength,
		found, foundStart, foundLength,
		trimAfter, trimAfterStart, trimAfterLength,
		delimiter, delimiterStart, delimiterLength,

		insertInto<B extends Element<unknown, unknown, unknown, unknown>, T extends LineContent<B>>(line: ParsedLine<T | StringLineContent<B>, B>, belongsTo: B, onFound: (found: string, foundStart: number, foundLength: number) => T | null) {
			if(this.trimBefore!=null && this.trimBeforeStart!=null && this.trimBeforeLength!=null) {
				line.content.push(new StringLineContent(this.trimBefore, this.trimBeforeStart, this.trimBeforeLength, belongsTo))
			}
	
			const toInsert = onFound(this.found, this.foundStart, this.foundLength)
			if(toInsert) {
				line.content.push(toInsert)
			}
	
			if(this.trimAfter!=null && this.trimAfterStart!=null && this.trimAfterLength!=null) {
				line.content.push(new StringLineContent(this.trimAfter, this.trimAfterStart, this.trimAfterLength, belongsTo))
			}
			if(this.delimiter!=null && this.delimiterStart!=null && this.delimiterLength!=null) {
				line.content.push(new StringLineContent(this.delimiter, this.delimiterStart, this.delimiterLength, belongsTo))
			}
	
			return this
		}
	}
}
