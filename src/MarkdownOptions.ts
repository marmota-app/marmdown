import { AdvancedConent, Updatable } from "./MarkdownDocument"

export interface Option extends Updatable {
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

export class UpdatableOption implements Option {
	private _parent: Updatable | undefined
	private _previous: Updatable | undefined

	constructor(
		public text: string,
		private _key: string, private _value: string,
		private _start: number, private _length: number,
	) {}

	get key() { return this._key }
	get value() { return this._value}
	get previous() { return this._previous }
	set previous(_previous: Updatable | undefined) { this._previous = _previous }
	get parent() { return this._parent }
	set parent(_parent: Updatable | undefined) { this._parent = _parent }
	get length() { return this._length }

	get start() {
		if(this._previous) {
			return this._previous.start + this._previous.length
		}
		if(this._parent) {
			return this._parent.start + this._parent.length
		}
		return this._start
	}
	set start(_start: number) { this._start = _start }
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
