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

import { Element, ParsedLine } from "$element/Element";

/**
 * Parses an element and supports line-by-line-parsing. 
 * 
 * When the text given to the parser can be parsed into the element type
 * supported by the parser, it returns the element as result, otherwise it
 * returns `null`.
 * 
 * Supports line-by-line-parsing by adding a new line to a given element.
 * 
 * @template RESULT the result type of this parser, also the type of the previous element
 * @template META_RESULT the type this parser returns, defaults to RESULT but can be a [meta block]{@tutorial meta-blocks.md}
 */
export abstract class Parser<
	RESULT extends Element<unknown, unknown, unknown, unknown> | unknown,
	META_RESULT extends Element<unknown, unknown, unknown, unknown> | unknown=RESULT,
> {
	/**
	 * The name of the element type returned by this parser. 
	 */
	abstract readonly elementName: string

	/**
	 * Try to parse a given line of text into the supported element type
	 * and add it to the previous element (if avaialbe).
	 * 
	 * - If there is no previous element **and** the text can be parsed into
	 *   the element type, returns the parsed element
	 * - If there is no previous element and the text **cannot** be parsed into
	 *   the element type, returns `null`
	 * - If there **is** a previous element **and** the text can be parsed and
	 *   **added** to the previous element, parses the text, adds it and returns
	 *   the previous element
	 * - If there **is** a previous element and the text **cannot** be parsed
	 *   or added to the previous element, returns `null`
	 * 
	 * @param previous The previous element. Try to parse and add the text to this element, if available
	 * @param text The complete text of the document
	 * @param start The start index of the line to parse, ignore everything before `start`
	 * @param length The length of the line to parse, ignore everything after `start+length`
	 */
	abstract parseLine(previous: RESULT | null, text: string, start: number, length: number): META_RESULT | null

	/**
	 * Parse an update to an original element, returning the parsed line type if the
	 * update could be parsed correctly. 
	 * 
	 * This method returns a new `ParsedLine` when the update can be handled
	 * by this parser (which means original element can be updated at this
	 * point), or null if it cannot. Hence, this method _can_ return null
	 * if it wants to pass handling the update to the block containing it.
	 * 
	 * By that mechanism, updates bubble "up" or "out": First, we try
	 * updating the innermost element, but when the parser of that element
	 * returns null, we try the container of that element, and so on.
	 * 
	 * Overrides of this method should **not** pass `original` to `parseLine`;
	 * at least in most cases, that would be the wrong behavior: A line update
	 * does not _extend_ the `original`. Instead, it tries to replace a line
	 * of original, so _if_ this method _does_ call `parseUpdate`, it should
	 * pass `null` for the parameter `previous`.
	 * 
	 * @param original The original element the update is being parsed for
	 * @param text The complete text of the document
	 * @param start The start index of the line to parse, ignore everything before `start`
	 * @param length The length of the line to parse, ignore everything after `start+length`
	 */
	parseLineUpdate(original: RESULT, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		const result = this.parseLine(null, text, start, length)

		if(result) {
			return (result as unknown as Element<unknown, unknown, unknown, unknown>).lines[0]
		}
		return null
	}
}
