/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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
export interface FindResult {
	foundText: string,
	completeText: string,
	length: number,
}
export interface FindOptions {
	whenFound?: (length: number, foundText: string) => unknown,
	maxLeadingSpaces?: number,
}

export function find(text: string, toFind: string | RegExp, startIndex: number, maxLength: number, { whenFound = ()=>{}, maxLeadingSpaces = -1}: FindOptions = {}): FindResult | null {
	let result = null

	const whitespaceMatcher = /[ \t]+/y
	whitespaceMatcher.lastIndex = startIndex
	const foundWhitespace = whitespaceMatcher.exec(text)
	let whitespaceLength = 0

	if(foundWhitespace) {
		if(maxLeadingSpaces >= 0 && foundWhitespace[0].length > maxLeadingSpaces) {
			return null
		}
		startIndex += foundWhitespace[0].length
		whitespaceLength = foundWhitespace[0].length
	}

	if(typeof toFind === 'string') {
		if(text.indexOf(toFind, startIndex) === startIndex) {
			result = {
				foundText: toFind,
				completeText: (foundWhitespace?.[0] ?? '') + toFind,
				length: whitespaceLength + toFind.length,
			}
		}
	} else {
		const searchRegex = new RegExp(toFind, 'y')
		searchRegex.lastIndex = startIndex
		const findResult = searchRegex.exec(text)

		if(findResult) {
			result = {
				foundText: findResult[0],
				completeText: (foundWhitespace?.[0] ?? '') + findResult[0],
				length: whitespaceLength + findResult[0].length,
			}
		}
	}

	if(result) {
		whenFound(result.length, result.completeText)
	}
	return result
}

export function findOne(text: string, toFind: (string | RegExp)[], startIndex: number, maxLength: number, options: FindOptions = {}): FindResult | null {
	for(var i=0; i<toFind.length; i++) {
		const result = find(text, toFind[i], startIndex, maxLength, options)
		if(result) { return result }
	}
	return null
}

export function skipSpaces(text: string, startIndex: number, maxLength: number, { whenFound = ()=>{}, maxLeadingSpaces=-1}: FindOptions = {}) {
	const whitespaceMatcher = /[ \t]+/y
	whitespaceMatcher.lastIndex = startIndex
	const foundWhitespace = whitespaceMatcher.exec(text)

	if(foundWhitespace) {
		if(maxLeadingSpaces > 0 && foundWhitespace[0].length > maxLeadingSpaces) {
			whenFound(maxLeadingSpaces, new Array(maxLeadingSpaces).fill(' ').join(''))
			return
		}
		whenFound(foundWhitespace[0].length, foundWhitespace[0])
	}
}
