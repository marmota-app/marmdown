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

import { Element } from "$element/Element";

/**
 * Parses an element and supports line-by-line-parsing. 
 * 
 * When the text given to the parser can be parsed into the element type
 * supported by the parser, it returns the element as result, otherwise it
 * returns `null`.
 * 
 * Supports line-by-line-parsing by adding a new line to a given element.
 */
export interface Parser<RESULT extends Element<unknown, unknown, unknown>> {
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
	parseLine(previous: RESULT | null, text: string, start: number, length: number): RESULT | null,
}
