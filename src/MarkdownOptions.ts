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
import { ParsedDocumentContent, Updatable } from "./Updatable"
import { OptionParser } from "./options/OptionParser"
import { OptionsParser } from "./options/OptionsParser"
import { TextParser } from "./parser/TextParser"
import { UpdatableElement } from "./UpdatableElement"

export interface ParsedOptionContent extends ParsedDocumentContent<unknown, unknown> {
	key: string,
	value: string,
}
export interface ParsedOptionsContent extends ParsedDocumentContent<Options, string | Option> {
	lineOptions: Option[],
}

export interface Option extends Updatable<Option, unknown, ParsedOptionContent> {
	key: string,
	value: string,
}
export type ContentOptions = {
	[key: string]: string,
}
export interface Options extends Updatable<Options, Option, ParsedOptionsContent>{
	readonly options: Option[],
	readonly asMap: ContentOptions,
}

export class UpdatableOption extends UpdatableElement<Option, unknown, ParsedOptionContent> implements Option {
	constructor(
		content: ParsedOptionContent, parsedWith?: TextParser<unknown, Option, ParsedOptionContent>,
	) {
		super([content], parsedWith)
	}

	get key() { return this.contents[0].key }
	get value() { return this.contents[0].value }
}

/**
 * The options of another markdown element. 
 * 
 * Options are in curly braces and usually come right after the start of an element.
 * Find out more about how options work from a user's perspective in
 * [/docs/markdown/options.md](/docs/markdown/options.md).
 * 
 * An object of this type contains zero or more `UpdatableOption` objects that represent
 * each option defined in the options block.
 * 
 * Each entry in the `contents` array represent one line from the document where options
 * were parsed.
 */
export class UpdatableOptions extends UpdatableElement<Options, string | Option, ParsedOptionsContent> implements Options {
	constructor(contents: ParsedOptionsContent[], parsedWith?: OptionsParser) {
		super(contents, parsedWith)
	}

	get options() {
		return this.contents.flatMap(c => c.lineOptions)
	}
	get asMap() {
		return this.options.reduce((p, c) => {
			return { ...p, [c.key]: c.value}
		}, {} as ContentOptions)
	}
}

export function serializeOptions(options: ContentOptions): string {
	let result = '{'

	if(options.default) {
		result += options.default
	}

	Object.keys(options).forEach(key => {
		if(key !== 'default') {
			if(result.length > 1) {
				result += ';'
			}
			result += key+'='+options[key]
		}
	})

	result += '}'
	return result
}
