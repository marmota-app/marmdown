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
import { BlockQuote } from "$element/MarkdownElements"
import { MfMBlockContentParser, MfMBlockElementContent } from "./MfMBlockContentParser"

export class MfMGeneralPurposeBlock extends GenericBlock<
	MfMGeneralPurposeBlock, MfMBlockElementContent, 'block-quote', MfMGeneralPurposeBlockParser
> implements BlockQuote<MfMGeneralPurposeBlock, MfMBlockElementContent> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: MfMGeneralPurposeBlockParser) { super(id, 'block-quote', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export class MfMGeneralPurposeBlockParser extends MfMBlockContentParser<MfMGeneralPurposeBlock, MfMGeneralPurposeBlockParser> {
	public readonly elementName = 'MfMGeneralPurposeBlock'
	readonly token = '>'

	override create(): MfMGeneralPurposeBlock {
		return new MfMGeneralPurposeBlock(this.parsers.idGenerator.nextId(), this)
	}
}
