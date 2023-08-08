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

import { LinkReference } from "$element/MarkdownElements"
import { MfMGenericBlock } from "$mfm/MfMGenericElement"
import { MfMParser } from "$mfm/MfMParser"
import { MfMLinkDestination, MfMLinkDestinationParser } from "$mfm/inline/link/MfMLinkDestination"
import { MfMLinkText, MfMLinkTextParser } from "$mfm/inline/link/MfMLinkText"
import { MfMLinkTitle, MfMLinkTitleParser } from "$mfm/inline/link/MfMLinkTitle"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"

export type MfMLinkReferenceContent = MfMLinkTitle | MfMLinkDestination | MfMLinkText
export class MfMLinkReference extends MfMGenericBlock<MfMLinkReference, MfMLinkReferenceContent, 'link-reference', MfMLinkReferenceParser> implements LinkReference<MfMLinkReference, MfMLinkReferenceContent, MfMLinkText, MfMLinkDestination, MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkReferenceParser) { super(id, 'link-reference', pw) }
}

export class MfMLinkReferenceParser extends MfMParser<
	MfMLinkReference, MfMLinkReference,
	MfMOptionsParser | MfMLinkTitleParser | MfMLinkDestinationParser | MfMLinkTextParser
> {
	public readonly elementName = 'MfMHeading'

	parseLine(previous: MfMLinkReference | null, text: string, start: number, length: number): MfMLinkReference | null {
		return null
	}
}
