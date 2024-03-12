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

import { Element, LineContent, ParsedLine } from "../element/Element";
import { ContentUpdate } from "../ContentUpdate";
import { jsonTransient } from "../jsonTransient";
import { Parsers } from "./Parsers";

export interface ParserUtils {
	lookahead: () => [number, number] | null,
}
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
	REQUIRED_PARSERS extends Parser<Element<unknown, unknown, unknown, unknown>> = any,
> {
	/**
	 * The name of the element type returned by this parser. 
	 */
	abstract readonly elementName: string

	constructor(readonly parsers: Parsers<REQUIRED_PARSERS>) {
		jsonTransient(this, 'parsers')
	}

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
	abstract parseLine(previous: RESULT | null, text: string, start: number, length: number, utils?: ParserUtils): META_RESULT | null

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
	parseLineUpdate(original: RESULT, text: string, start: number, length: number, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>): ParsedLine<unknown, unknown> | null {
		const result = this.parseLine(null, text, start, length)

		if(result) {
			return (result as unknown as Element<unknown, unknown, unknown, unknown>).lines[0]
		}
		return null
	}

	/**
	 * Checks whether the original result can be updated by the update parser. 
	 * 
	 * @param original The original result that should be updated
	 * @returns true when the original result can be updated, false otherwise
	 */
	canUpdate(original: RESULT, update: ContentUpdate, replacedText: string): boolean {
		return true
	}

	isFullyParsedUpdate(update: LineContent<Element<unknown, unknown, unknown, unknown>>, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>) {
		return true
	}

	/**
	 * Checks whether this parser should interrupt another element (can happen
	 * because the text can be parsed by this parser and the resulting element
	 * might have a higher priority).
	 * 
	 * Usually, this is done by checking whether the parser can parse a certain
	 * text as the first line of its element. 
	 * 
	 * @param element The current element (that might get interrupted)
	 * @param text The text to check whether it could be parsed
	 * @param start The start of the line that should be checked
	 * @param length The length of the line that should be checked
	 * @returns true when the given text requires the parser to interrupt the current element
	 */
	shouldInterrupt(element: Element<unknown, unknown, unknown, unknown>, text: string, start: number, length: number): boolean {
		return this.parseLine(null, text, start, length) != null
	}
}

/**
 * Abstract Parser<> to parse Inlines with common functionality. 
 * 
 * This parser returns null when there is a previous result, since inlines
 * can never span more than a line. It also makes sure that the parsed
 * result has exactly one line.
 */
export abstract class InlineParser<
	RESULT extends Element<unknown, unknown, unknown, unknown>,
	REQUIRED_PARSERS extends Parser<Element<unknown, unknown, unknown, unknown>> = any
> extends Parser<RESULT, RESULT, REQUIRED_PARSERS> {
	abstract parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any }): RESULT | null

	override parseLine(previous: RESULT | null, text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): RESULT | null {
		if(previous != null) { return null }

		const result = this.parseInline(text, start, length, additionalParams)

		if(result && result.lines.length !== 1) {
			throw new Error(`Could not parse ${text.substring(start, start+length)}: Expected inline to return 1 line, but it returned ${result.lines.length}`)
		}

		return result
	}
}