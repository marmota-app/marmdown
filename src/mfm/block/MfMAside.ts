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

import { GenericBlock } from "$element/GenericElement"
import { Aside, BlockQuote } from "$element/MarkdownElements"
import { EMPTY_OPTIONS, MfMOptions, Options } from "$mfm/options/MfMOptions"
import { MfMBlockContentParser, MfMBlockElementContent } from "./MfMBlockContentParser"

export class MfMAside extends GenericBlock<
	MfMAside, MfMBlockElementContent, 'aside', MfMAsideParser
> implements Aside<MfMAside, MfMBlockElementContent> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: MfMAsideParser) { super(id, 'aside', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
	get options(): MfMOptions {
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? EMPTY_OPTIONS
	}
}

export class MfMAsideParser extends MfMBlockContentParser<MfMAside, MfMAsideParser> {
	public readonly elementName = 'MfMAside'
	readonly token = '^'

	override create(): MfMAside {
		return new MfMAside(this.parsers.idGenerator.nextId(), this)
	}
}
