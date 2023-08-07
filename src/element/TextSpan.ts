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

import { ContentUpdate } from "$markdown/ContentUpdate";
import { IdGenerator } from "$markdown/IdGenerator";
import { Parser } from "$parser/Parser";
import { ContainerInline, Element, Inline, LineContent, ParsedLine } from "./Element";
import { GenericContainerInline } from "./GenericElement";

type UnknownInline = Inline<unknown, unknown, LineContent<unknown>, unknown>
export class TextSpan<CONTENT extends UnknownInline> extends GenericContainerInline<TextSpan<CONTENT>, CONTENT, LineContent<TextSpan<CONTENT>>, '--text-span--', TextSpanParser> implements ContainerInline<TextSpan<CONTENT>, CONTENT, '--text-span--'> {
	constructor(id: string, pw: TextSpanParser) { super(id, '--text-span--', pw) }
}

export class TextSpanParser extends Parser<TextSpan<any>> {
	public readonly elementName = 'TextSpan'

	parseLine(previous: TextSpan<any> | null, text: string, start: number, length: number): TextSpan<any> | null {
		throw new Error('Cannot parse text spans, use create(...) to create a text span!');
	}

	create<T extends UnknownInline>(): TextSpan<T> {
		const textSpan = new TextSpan<T>(this.parsers.idGenerator.nextId(), this)
		return textSpan
	}

	override canUpdate(original: TextSpan<any>, update: ContentUpdate, replacedText: string): boolean {
		return false
	}

	override parseLineUpdate(original: TextSpan<any>, text: string, start: number, length: number, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>): ParsedLine<unknown, unknown> | null {
		return null
	}
}
