import { AdvancedConent, Updatable } from "./MarkdownDocument"
import { TextParser } from "./parser/TextParser"
import { UpdatableElement } from "./UpdatableElement"

export interface Option extends Updatable<Option> {
	key: string,
	value: string,
}
export type ContentOptions = {
	[key: string]: string,
}
export interface Options {
	readonly options: Option[],
	readonly asMap: ContentOptions,
}

export const DEFAULT_OPTIONS: Options = {
	options: [],
	asMap: {},
}

export class UpdatableOption extends UpdatableElement<Option> implements Option {
	constructor(
		public text: string,
		private _key: string, private _value: string,
		_start: number, _length: number, parsedWith: TextParser<Option>,
	) {
		super(_start, _length, parsedWith)
	}

	get key() { return this._key }
	get value() { return this._value}
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
