import { AdvancedConent, Updatable, UpdatableContainer } from "./MarkdownDocument"
import { TextParser } from "./parser/TextParser"
import { UpdatableContainerElement, UpdatableElement } from "./UpdatableElement"

export interface Option extends Updatable<Option> {
	key: string,
	value: string,
}
export type ContentOptions = {
	[key: string]: string,
}
export interface Options extends UpdatableContainer<Options>{
	readonly options: Option[],
	readonly asMap: ContentOptions,
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

export class UpdatableOptions extends UpdatableContainerElement<Options> implements Options {
	constructor(
		private _parts: (string | Option)[],
		_start: number, _length: number, parsedWith: TextParser<Options>,
	) {
		super(_start, _length, parsedWith)
	}

	get parts() {
		return this._parts
	}
	get options() {
		return this._parts.filter(v => (typeof v)==='object') as Option[]
	}

	get text() {
		return this._parts.reduce((r: string, p) => {
			if((p as Updatable<unknown>).text != null) {
				return r+(p as Updatable<unknown>).text
			}
			return r+(p as string)
		}, '')
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
