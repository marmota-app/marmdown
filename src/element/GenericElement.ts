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

import { jsonTransient } from "../jsonTransient";
import { Parser } from "../parser/Parser";
import { Block, Element, Inline, LineContent, ParsedLine } from "./Element";

abstract class LineBasedElement<THIS extends Element<unknown, unknown, unknown, unknown> | unknown> {
	abstract readonly lines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[]

	addLine(lineId: string) {
		const line = new ParsedLine(lineId, this)
		this.lines.push(line as unknown as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>)
		return line
	}

	childrenChanged: (() => unknown) | undefined
}

export abstract class GenericBlock<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends LineBasedElement<THIS> implements Block<THIS, CONTENT, TYPE> {
	readonly classification: string = 'block'

	private _lines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] = []
	public get lines(): ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] {
		return this._lines
	}

	public get content(): CONTENT[] {
		return this._lines
			.flatMap(l => l.content)
			.filter(lc => lc.belongsTo !== this && lc.belongsTo.type !== 'options')
			.map(lc => lc.belongsTo as CONTENT)
			.reduce((result: CONTENT[], current: CONTENT) => {
				if(result.length === 0 || result[result.length-1] !== current) {
					result.push(current)
				}
				return result
			}, [] as CONTENT[])
	}

	constructor(public id: string, public readonly type: TYPE, public readonly parsedWith: PARSER) { super() }

	get isFullyParsed() { return true }

	addContent(content: CONTENT) {
		if(this._lines.length === 0) {
			//FIXME remove and throw exception
			const newId = this.parsedWith.parsers.idGenerator.nextLineId()
			this._lines.push(new ParsedLine(newId, this as unknown as THIS))
		}

		const i = content as Element<unknown, unknown, unknown, unknown>
		const lastItemLine = i.lines[i.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>

		if(lastItemLine) {
			this._lines[this._lines.length-1].content.push(lastItemLine)
		}
	}
}

export abstract class GenericLeafInline<
	THIS extends Inline<THIS, CONTENT, LINE_CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE_CONTENT extends LineContent<THIS>,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends LineBasedElement<THIS> implements Inline<THIS, CONTENT, LINE_CONTENT, TYPE> {
	readonly classification: string = 'inline'

	public readonly lines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] = []
	public readonly content: CONTENT[] = []

	constructor(public id: string, public readonly type: TYPE, public readonly parsedWith: PARSER) {
		super()
		jsonTransient(this, 'lines')
	}

	get isFullyParsed() { return true }

	addContent(content: CONTENT) {
		if(this.lines.length === 0) {
			//FIXME remove and throw exception
			const newId = this.parsedWith.parsers.idGenerator.nextLineId()
			this.lines.push(new ParsedLine(newId, this as unknown as THIS))
		}
		
		const i = content as Element<unknown, unknown, unknown, unknown>
		const lastItemLine = i.lines[i.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
		this.lines[this.lines.length-1].content.push(lastItemLine)

		this.content.push(content)
	}
}

export class GenericContainerInline<
	THIS extends Inline<THIS, CONTENT, LINE_CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE_CONTENT extends LineContent<THIS>,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends LineBasedElement<THIS> implements Inline<THIS, CONTENT, LINE_CONTENT, TYPE> {
	readonly classification: string = 'inline'

	public readonly lines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] = []

	constructor(public id: string, public readonly type: TYPE, public readonly parsedWith: PARSER) {
		super()
		jsonTransient(this, 'lines')
	}

	get isFullyParsed() { return true }

	addContent(content: CONTENT) {
		if(this.lines.length === 0) {
			//FIXME remove and throw exception
			const newId = this.parsedWith.parsers.idGenerator.nextLineId()
			this.lines.push(new ParsedLine(newId, this as unknown as THIS))
		}
		
		const i = content as Element<unknown, unknown, unknown, unknown>
		const lastItemLine = i.lines[i.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
		this.lines[this.lines.length-1].content.push(lastItemLine)
	}

	get content(): CONTENT[] {
		return this.lines
		.flatMap(l => l.content)
		.filter(lc => lc.belongsTo !== this && lc.belongsTo.type !== 'options')
		.map(lc => lc.belongsTo as CONTENT)
		.reduce((result: CONTENT[], current: CONTENT) => {
			if(result.length === 0 || result[result.length-1] !== current) {
				result.push(current)
			}
			return result
		}, [] as CONTENT[])
	}
}
