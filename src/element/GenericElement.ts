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

import { Block, Element, Inline, LineContent } from "./Element";

export abstract class GenericBlock<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
> implements Block<THIS, CONTENT, TYPE> {
	public readonly lines: LineContent<THIS>[] = []
	public readonly content: CONTENT[] = []

	constructor(public readonly id: string, public readonly type: TYPE) {}

	get asText() { return '' }
}

export abstract class GenericInline<
	THIS extends Inline<THIS, CONTENT, LINE, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown> | never | unknown,
	LINE extends LineContent<THIS>,
	TYPE extends string | unknown,
> implements Inline<THIS, CONTENT, LINE, TYPE> {
	public readonly lines: LINE[] = []
	public readonly content: CONTENT[] = []

	constructor(public readonly id: string, public readonly type: TYPE) {}

	get asText() { return '' }
}
