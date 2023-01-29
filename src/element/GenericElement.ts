/*
Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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

import { jsonTransient } from "$markdown/jsonTransient";
import { Parser } from "$parser/Parser";
import { Block, Element, Inline, LineContent, ParsedLine } from "./Element";

export abstract class GenericBlock<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> implements Block<THIS, CONTENT, TYPE> {
	public readonly lines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] = []
	public readonly content: CONTENT[] = []

	constructor(public id: string, public readonly type: TYPE, public readonly parsedWith: PARSER) {
		jsonTransient(this, 'lines')
	}

	get isFullyParsed() { return true }

	addContent(content: CONTENT) {
		if(this.lines.length === 0) { this.lines.push(new ParsedLine(this as unknown as THIS)) }

		const i = content as Element<unknown, unknown, unknown, unknown>
		const lastItemLine = i.lines[i.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>

		if(lastItemLine) {
			this.lines[this.lines.length-1].content.push(lastItemLine)
		}

		this.content.push(content)
	}
}

export abstract class GenericInline<
	THIS extends Inline<THIS, CONTENT, LINE_CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE_CONTENT extends LineContent<THIS>,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> implements Inline<THIS, CONTENT, LINE_CONTENT, TYPE> {
	public readonly lines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] = []
	public readonly content: CONTENT[] = []

	constructor(public id: string, public readonly type: TYPE, public readonly parsedWith: PARSER) {
		jsonTransient(this, 'lines')
	}

	get isFullyParsed() { return true }

	addContent(content: CONTENT) {
		if(this.lines.length === 0) { this.lines.push(new ParsedLine(this as unknown as THIS)) }
		
		const i = content as Element<unknown, unknown, unknown, unknown>
		const lastItemLine = i.lines[i.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
		this.lines[this.lines.length-1].content.push(lastItemLine)

		this.content.push(content)
	}
}
