import { Updatable, UpdatableContainer } from "./MarkdownDocument";
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

export class UpdatableContainerElement<T, P> extends UpdatableElement<T> implements Partial<UpdatableContainer<T, P>> {
	constructor(
		private _parts: P[],
		_start: number, parsedWith: TextParser<T>,
	) {
		super(_start, 0, parsedWith)
	}

	get parts() {
		return this._parts
	}
	get asText() {
		return this._parts.reduce((r: string, p) => {
			if((p as unknown as Updatable<unknown>).asText != null) {
				return r+(p as unknown as Updatable<unknown>).asText
			}
			return r+(p as unknown as string)
		}, '')
	}
	get length() {
		return this.asText.length
	}
}