/*
Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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

import { ContainerBlock } from "$element/Element";
import { Parser } from "$parser/Parser";

/**
 * Parses a document line-by-line.
 */
export class LineByLineParser<CONTAINER extends ContainerBlock<unknown, unknown, unknown>> {
	constructor(private containerParser: Parser<CONTAINER>) {}

	/**
	 * Splits the document text into individual lines and uses the `containerParser`
	 * to add each of the parsed lines to the resulting document. 
	 * 
	 * @param text The complete text of the document
	 * @returns The parsed document as `CONTAINER`, or `null` when the document was empty
	 * @throws ParseError when the document could not be fully parsed
	 */
	parse(text: string): CONTAINER | null {
		let lineNumber = 0
		let start = 0
		const skipSingleLineEnding = () => {
			if(text.charAt(start) === '\n') {
				start++
			} else if(text.charAt(start) === '\r') {
				start += (text.length > start+1 && text.charAt(start+1)==='\n')? 2 : 1
			}
		}

		let result: CONTAINER | null = null

		while(start < text.length) {
			lineNumber++

			const crIndex = text.indexOf('\r', start)
			const nlIndex = text.indexOf('\n', start)

			const length = nlIndex > 0?
				(crIndex > 0? Math.min(nlIndex, crIndex)-start : nlIndex-start):
				(crIndex > 0? crIndex-start : text.length-start)
			
			let current = this.containerParser.parseLine(result, text, start, length)
			if(!current) {
				throw new ParseError(
					text.substring(start, start+length),
					lineNumber,
					result,
				)
			}
			if(result == null) {result = current}
			if(result !== current) {
				throw new ParseError(
					text.substring(start, start+length),
					lineNumber,
					result,
				)
			}

			start += length
			skipSingleLineEnding()
		}
		return result
	}
}

/**
 * Error thrown when {@link LineByLineParser} could not parse the complete document. 
 */
export class ParseError<CONTAINER extends ContainerBlock<unknown, unknown, unknown>> extends Error {
	/**
	 * @param errorLine The line of the document that caused the error
	 * @param errorLineNumber The line number of the errornous line
	 * @param incompleteDocument The document that has been parsed up unti the error
	 */
	constructor(errorLine: string, errorLineNumber: number, public readonly incompleteDocument: CONTAINER | null) {
		super(`Could not parse document completely, bailed out at line  ${errorLineNumber} "${errorLine}"`)
	}
}
