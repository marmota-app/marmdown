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

import { Element, StringLineContent } from "$element/Element"
import { LinkReference } from "$element/MarkdownElements"
import { ContentUpdate } from "$markdown/ContentUpdate"
import { MfMGenericBlock } from "$mfm/MfMGenericElement"
import { MfMParser } from "$mfm/MfMParser"
import { MfMLinkDestination, MfMLinkDestinationParser } from "$mfm/inline/link/MfMLinkDestination"
import { MfMLinkText, MfMLinkTextParser } from "$mfm/inline/link/MfMLinkText"
import { MfMLinkTitle, MfMLinkTitleParser } from "$mfm/inline/link/MfMLinkTitle"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { skipSpaces } from "$parser/isWhitespace"

export type MfMLinkReferenceContent = MfMLinkTitle | MfMLinkDestination | MfMLinkText
export class MfMLinkReference extends MfMGenericBlock<MfMLinkReference, MfMLinkReferenceContent, 'link-reference', MfMLinkReferenceParser> implements LinkReference<MfMLinkReference, MfMLinkReferenceContent, MfMLinkText, MfMLinkDestination, MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkReferenceParser) { super(id, 'link-reference', pw) }

	get text(): MfMLinkText | undefined { return this.content.find(c => c.type==='link-text') as MfMLinkText }
	get destination(): MfMLinkDestination | undefined { return this.content.find(c => c.type==='link-destination') as MfMLinkDestination }
	get title(): MfMLinkTitle | undefined { return this.content.find(c => c.type === 'link-title') as MfMLinkTitle }
}

export class MfMLinkReferenceParser extends MfMParser<
	MfMLinkReference, MfMLinkReference,
	MfMOptionsParser | MfMLinkTitleParser | MfMLinkDestinationParser | MfMLinkTextParser
> {
	public readonly elementName = 'MfMLinkReference'

	/**
	 * Parses a link reference, if possible. 
	 * 
	 * TODO: The method should also support text-spans: Right now, it returns
	 *       null when the reference could not be parsed. But the method might
	 *       already have put a lot of effort into parsing the current line,
	 *       and instead of returning null, it could also return a text-span,
	 *       like MfMLink does.
	 */
	parseLine(previous: MfMLinkReference | null, text: string, start: number, length: number): MfMLinkReference | null {
		if(previous !== null) { return null }

		const reference = new MfMLinkReference(this.parsers.idGenerator.nextId(), this)
		reference.options.isFullyParsed = true //Link references cannot have options!
		const line = reference.addLine(this.parsers.idGenerator.nextLineId())

		let i=0
		let skipped = skipSpaces(text, start+i, length-i)
		if(skipped > 3) { return null }
		if(skipped > 0) {
			line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, reference))
			i += skipped
		}
		if(text.charAt(start+i) !== '[') { return null }
		line.content.push(new StringLineContent('[', start+i, 1, reference))
		i++

		const linkText = this.parsers.MfMLinkText.parseLine(null, text, start+i, length-i)
		if(linkText == null || linkText.content.length === 0) { return null }
		reference.addContent(linkText)
		i += linkText.lines[0].length

		if(text.charAt(start+i) !== ']' || text.charAt(start+i+1) !== ':') { return null }
		line.content.push(new StringLineContent(']:', start+i, 2, reference))
		i+=2

		skipped = skipSpaces(text, start+i, length-i)
		if(skipped > 0) {
			line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, reference))
			i += skipped
		}

		const linkDestination = this.parsers.MfMLinkDestination.parseLine(null, text, start+i, length-i)
		if(linkDestination == null || linkDestination.lines[0].length === 0) { return null }
		reference.addContent(linkDestination)
		i += linkDestination.lines[0].length

		skipped = skipSpaces(text, start+i, length-i)
		if(skipped > 0) {
			line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, reference))
			i += skipped
		}

		if(i < length && skipped > 0) {
			const linkTitle = this.parsers.MfMLinkTitle.parseLine(null, text, start+i, length-i)
			if(linkTitle != null && linkTitle.value.length > 0) {
				reference.addContent(linkTitle)
				i += linkTitle.lines[0].length

				skipped = skipSpaces(text, start+i, length-i)
				if(skipped > 0) {
					line.content.push(new StringLineContent(text.substring(start+i, start+length), start+i, skipped, reference))
					i += skipped
				}
			}
		}

		if(i < length) {
			return null
		}

		return reference
	}

	override canUpdate(original: MfMLinkReference, update: ContentUpdate, replacedText: string): boolean {
		for(let c of update.text) {
			switch(c) {
				case '(': case ')': case '[': case ']': case '"': case "'": case '\\': case '<': case '>': return false
			}
		}
		for(let c of replacedText) {
			switch(c) {
				case '(': case ')': case '[': case ']': case '"': case "'": case '\\': case '<': case '>': return false
			}
		}
		return super.canUpdate(original, update, replacedText)
	}

	override shouldInterrupt(element: Element<unknown, unknown, unknown, unknown>, text: string, start: number, length: number): boolean {
		return false
	}
}
