import { Updatable } from "./MarkdownDocument";
import { TextParser } from "./parser/TextParser";

export class UpdatableElement<T> implements Partial<Updatable<T>> {
	private _parent: Updatable<unknown> | undefined
	private _previous: Updatable<unknown> | undefined

	constructor(
		private _start: number, private _length: number, public readonly parsedWith: TextParser<T>,
	) {}

	get previous() { return this._previous }
	set previous(_previous: Updatable<unknown> | undefined) { this._previous = _previous }
	get parent() { return this._parent }
	set parent(_parent: Updatable<unknown> | undefined) { this._parent = _parent }
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
