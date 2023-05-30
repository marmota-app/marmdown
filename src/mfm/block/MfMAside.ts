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

import { Aside } from "$element/MarkdownElements"
import { MfMGenericContainerBlock } from "$mfm/MfMGenericElement"
import { MfMBlockContentParser, MfMBlockElementContent } from "./MfMBlockContentParser"

export class MfMAside extends MfMGenericContainerBlock<
	MfMAside, MfMBlockElementContent, 'aside', MfMAsideParser
> implements Aside<MfMAside, MfMBlockElementContent> {
	protected self: MfMAside = this
	constructor(id: string, pw: MfMAsideParser) { super(id, 'aside', pw) }
}

export class MfMAsideParser extends MfMBlockContentParser<MfMAside, MfMAsideParser> {
	public readonly elementName = 'MfMAside'
	readonly token = '^'

	override create(): MfMAside {
		return new MfMAside(this.parsers.idGenerator.nextId(), this)
	}
}
