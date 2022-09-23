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
import { AdvancedConent, Updatable, UpdatableContainer } from "./MarkdownDocument"
import { OptionParser } from "./options/OptionParser"
import { OptionsParser } from "./options/OptionsParser"
import { TextParser } from "./parser/TextParser"
import { UpdatableContainerElement, UpdatableElement } from "./UpdatableElement"

export interface Option extends Updatable<Option> {
	key: string,
	value: string,
}
export type ContentOptions = {
	[key: string]: string,
}
export interface Options extends UpdatableContainer<Options, string | Option>{
	readonly options: Option[],
	readonly asMap: ContentOptions,
}

export class UpdatableOption extends UpdatableElement<Option> implements Option {
	constructor(
		public asText: string,
		private _key: string, private _value: string,
		_start: number, _length: number, parsedWith?: TextParser<Option>,
	) {
		super(_start, _length, parsedWith)
	}

	get key() { return this._key }
	get value() { return this._value}
}

export class UpdatableOptions extends UpdatableContainerElement<Options, string | Option> implements Options {
	constructor(_parts: (string | Option)[], _start: number, parsedWith?: OptionsParser) {
		super(_parts, _start, parsedWith)
	}

	get options() {
		return this.parts.filter(v => (typeof v)==='object') as Option[]
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
