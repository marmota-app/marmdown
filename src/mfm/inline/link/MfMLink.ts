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

import { Inline, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { Image, Link } from "$element/MarkdownElements"
import { TextSpan, TextSpanParser } from "$element/TextSpan"
import { MfMInlineElements } from "$markdown/MfMDialect"
import { INCREASING, finiteLoop } from "$markdown/finiteLoop"
import { MfMGenericContainerInline } from "$mfm/MfMGenericElement"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { InlineParser } from "$parser/Parser"
import { isWhitespace } from "$parser/isWhitespace"
import { parseInlineContent } from "$parser/parse"
import { MfMContentLine } from "../MfMContentLine"
import { MfMLinkTitle, MfMLinkTitleParser } from "./MfMLinkTitle"
import { MfMText, MfMTextParser } from "../MfMText"
import { MfMLinkText, MfMLinkTextParser } from "./MfMLinkText"
import { MfMLinkDestination, MfMLinkDestinationParser } from "./MfMLinkDestination"

type LinkContent = MfMLinkText | MfMLinkDestination | MfMLinkTitle
export class MfMLink extends MfMGenericContainerInline<MfMLink, LinkContent, LineContent<MfMLink>, 'link', MfMLinkParser> implements Link<MfMLink, LinkContent, MfMLinkText, MfMLinkDestination, MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkParser) { super(id, 'link', pw) }

	get text(): MfMLinkText | undefined { return this.content.find(c => c.type==='link-text') as MfMLinkText }
	get destination(): MfMLinkDestination | undefined { return this.content.find(c => c.type==='link-destination') as MfMLinkDestination }
	get title(): MfMLinkTitle | undefined { return this.content.find(c => c.type === 'link-title') as MfMLinkTitle }
}
export class MfMImage extends MfMGenericContainerInline<MfMImage, LinkContent, LineContent<MfMImage>, 'image', MfMLinkParser> implements Image<MfMImage, LinkContent, MfMLinkText, MfMLinkDestination, MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkParser) { super(id, 'image', pw) }

	get altText(): MfMLinkText | undefined { return undefined }
	get destination(): MfMLinkDestination | undefined { return undefined }
	get title(): MfMLinkTitle | undefined { return undefined }
}

export class MfMLinkParser extends InlineParser<
	MfMLink | MfMImage | TextSpan<MfMInlineElements>,
	MfMTextParser | MfMOptionsParser | MfMLinkTextParser | MfMLinkDestinationParser | MfMLinkTitleParser | TextSpanParser
> {
	public readonly elementName = 'MfMLink'

	override parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMLink | MfMImage | TextSpan<MfMInlineElements> | null {
		if(text.charAt(start) === '[') {
			let i=1
			const link = new MfMLink(this.parsers.idGenerator.nextId(), this)
			const line = link.addLine(this.parsers.idGenerator.nextLineId())
			const linkText = this.parsers.MfMLinkText.parseLine(null, text, start+i, length-i, additionalParams)
	
			line.content.push(new StringLineContent('[', start, 1, link))
			if(linkText && linkText.content.length > 0) {
				link.addContent(linkText)
				i += linkText.lines[0].length
			}
			if(text.charAt(start+i) !== ']') {
				const textSpan = this.parsers.TextSpan.create<MfMInlineElements>()
				const openingText = this.parsers.MfMText.parseLine(null, text, start, 1) as MfMText
				textSpan.addContent(openingText)
				if(linkText && linkText.content.length > 0) {
					textSpan.addContent(linkText)
				}
				return textSpan
			}
			line.content.push(new StringLineContent(']', start+i, 1, link))
			i++
			if(text.charAt(start+i) === '(') {
				line.content.push(new StringLineContent('(', start+i, 1, link))
				i++
				const skipped = this.skipSpaces(text, start+i, length-i)
				if(skipped > 0) {
					line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, link))
					i += skipped
				}

				const linkDestination = this.parsers.MfMLinkDestination.parseLine(null, text, start+i, length-i, additionalParams)
				if(linkDestination != null && linkDestination.target.length > 0) {
					link.addContent(linkDestination)
					i += linkDestination.lines[0].length
				}
				if(linkDestination == null || isWhitespace(text.charAt(start+i))) {
					const skipped = this.skipSpaces(text, start+i, length-i)
					if(skipped > 0) {
						line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, link))
						i += skipped
					}

					const linkTitle = this.parsers.MfMLinkTitle.parseLine(null, text, start+i, length-i, additionalParams)
					if(linkTitle !== null) {
						link.addContent(linkTitle)
						i += linkTitle.lines[0].length
					}
				}
				if(text.charAt(start+i) !== ')') {
					const textSpan = this.parsers.TextSpan.create<MfMInlineElements>()
					const openingText = this.parsers.MfMText.parseLine(null, text, start, 1) as MfMText
					textSpan.addContent(openingText)
					let restIndex = 1
					if(linkText && linkText.content.length > 0) {
						textSpan.addContent(linkText)
						restIndex += linkText.lines[0].length
					}
					const rest = this.parsers.MfMText.parseLine(null, text, start+restIndex, i-restIndex) as MfMText
					textSpan.addContent(rest)
					return textSpan
				}
				line.content.push(new StringLineContent(')', start+i, 1, link))
			}
	
			return link
		}

		return null
	}

	private skipSpaces(text: string, start: number, length: number) {
		let i = 0
		const loop = finiteLoop(() => i, INCREASING)
		while(i < length && isWhitespace(text.charAt(start+i))) {
			loop.guard()
			i++
		}
		return i
	}
}
