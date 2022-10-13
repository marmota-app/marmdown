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
import { Updatable, UpdatableContainer } from "./MarkdownDocument";
import { TextParser } from "./parser/TextParser";

export abstract class UpdatableElement<T> implements Updatable<T> {
	private _parent: Updatable<unknown> | undefined
	private _previous: Updatable<unknown> | undefined

	constructor(
		private _start: number, private _length: number, public readonly parsedWith?: TextParser<Updatable<T>>,
	) {}

	abstract get asText(): string

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

export class UpdatableContainerElement<T, P> extends UpdatableElement<T> implements UpdatableContainer<T, P> {
	constructor(
		private _parts: P[],
		_start: number, parsedWith?: TextParser<Updatable<T>>,
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