import { AdvancedConent, Updatable, UpdatableContainer } from "./MarkdownDocument"
import { OptionsParser } from "./options/OptionsParser"
import { TextParser } from "./parser/TextParser"
import { UpdatableContainerElement, UpdatableElement } from "./UpdatableElement"

const DEFAULT_OPTIONS_PARSER = new OptionsParser()

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
		_start: number, _length: number, parsedWith: TextParser<Option>,
	) {
		super(_start, _length, parsedWith)
	}

	get key() { return this._key }
	get value() { return this._value}
}

export class UpdatableOptions extends UpdatableContainerElement<Options, string | Option> implements Options {
	constructor(_parts: (string | Option)[], _start: number, parsedWith: OptionsParser = DEFAULT_OPTIONS_PARSER) {
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
