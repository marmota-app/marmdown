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
import { ContentUpdate } from "$markdown/ContentUpdate"

type LinkContent = MfMLinkText | MfMLinkDestination | MfMLinkTitle
class MfMLinkBase<THIS extends MfMLink | MfMImage,TYPE extends 'image' | 'link'> extends MfMGenericContainerInline<THIS, LinkContent, LineContent<THIS>, TYPE, MfMLinkParser> {
	#collapsed = false

	constructor(id: string, type: TYPE, pw: MfMLinkParser) { super(id, type, pw) }

	get text(): MfMLinkText | undefined { return this.content.find(c => c.type==='link-text') as MfMLinkText }
	get destination(): MfMLinkDestination | undefined { return this.content.find(c => c.type==='link-destination') as MfMLinkDestination }
	get title(): MfMLinkTitle | undefined { return this.content.find(c => c.type === 'link-title') as MfMLinkTitle }
	get references(): MfMLinkText | undefined {
		if(this.#collapsed) { return this.text }

		const texts = this.content.filter(c => c.type === 'link-text') as MfMLinkText[]
		if(texts.length > 1) { return texts[1] }

		return undefined
	}

	collapse() {
		this.#collapsed = true
	}
}
export class MfMLink extends MfMLinkBase<MfMLink, 'link'> implements Link<MfMLink, LinkContent, MfMLinkText, MfMLinkDestination, MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkParser) { super(id, 'link', pw) }
}
export class MfMImage extends MfMLinkBase<MfMImage, 'image'> implements Image<MfMImage, LinkContent, MfMLinkText, MfMLinkDestination, MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkParser) { super(id, 'image', pw) }
}

export class MfMLinkParser extends InlineParser<
	MfMLink | MfMImage | TextSpan<MfMInlineElements>,
	MfMTextParser | MfMOptionsParser | MfMLinkTextParser | MfMLinkDestinationParser | MfMLinkTitleParser | TextSpanParser
> {
	public readonly elementName = 'MfMLink'

	override parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMLink | MfMImage | TextSpan<MfMInlineElements> | null {
		if(text.charAt(start) === '!') {
			const image = new MfMImage(this.parsers.idGenerator.nextId(), this)
			const contentBefore = new StringLineContent('!', start, 1, image)
			return this.#parseLinkContent(image, text, start+1, length-1, additionalParams, contentBefore)
		}
		const link = new MfMLink(this.parsers.idGenerator.nextId(), this)
		return this.#parseLinkContent(link, text, start, length, additionalParams)
	}

	#parseLinkContent(result: MfMLink | MfMImage, text: string, start: number, length: number, additionalParams: { [key: string]: any }, contentBefore?: StringLineContent<MfMLink | MfMImage>) {
		if(text.charAt(start) === '[') {
			let i=1
			const line = result.addLine(this.parsers.idGenerator.nextLineId())
			const linkText = this.parsers.MfMLinkText.parseLine(null, text, start+i, length-i, additionalParams)
	
			if(contentBefore) { line.content.push(contentBefore) }
			line.content.push(new StringLineContent('[', start, 1, result))
			if(linkText && linkText.content.length > 0) {
				result.addContent(linkText)
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
			line.content.push(new StringLineContent(']', start+i, 1, result))
			i++
			if(text.charAt(start+i) === '(') {
				line.content.push(new StringLineContent('(', start+i, 1, result))
				i++
				const skipped = this.#skipSpaces(text, start+i, length-i)
				if(skipped > 0) {
					line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, result))
					i += skipped
				}

				const linkDestination = this.parsers.MfMLinkDestination.parseLine(null, text, start+i, length-i, additionalParams)
				if(linkDestination != null && linkDestination.target.length > 0) {
					result.addContent(linkDestination)
					i += linkDestination.lines[0].length
				}
				if(linkDestination == null || isWhitespace(text.charAt(start+i))) {
					const skipped = this.#skipSpaces(text, start+i, length-i)
					if(skipped > 0) {
						line.content.push(new StringLineContent(text.substring(start+i, start+i+skipped), start+i, skipped, result))
						i += skipped
					}

					const linkTitle = this.parsers.MfMLinkTitle.parseLine(null, text, start+i, length-i, additionalParams)
					if(linkTitle !== null) {
						result.addContent(linkTitle)
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
				line.content.push(new StringLineContent(')', start+i, 1, result))
				i++
			} else if(text.charAt(start+i) === '[') {
				line.content.push(new StringLineContent('[', start+i, 1, result))
				i++
				if(text.charAt(start+i) === ']') {
					line.content.push(new StringLineContent(']', start+i, 1, result))
					result.collapse()
					i++
				} else {
					const references = this.parsers.MfMLinkText.parseLine(null, text, start+i, length-i, additionalParams)

					if(references && references.content.length > 0) {
						result.addContent(references)
						i += references.lines[0].length
					}
					if(text.charAt(start+i) !== ']') {
						const textSpan = this.parsers.TextSpan.create<MfMInlineElements>()
						const openingDelimiter = this.parsers.MfMText.parseLine(null, text, start, 1) as MfMText
						textSpan.addContent(openingDelimiter)
						let textEnd = 1
						if(linkText && linkText.content.length > 0) {
							textSpan.addContent(linkText)
							textEnd += linkText.lines[0].length
						}
						const innerDelimiter = this.parsers.MfMText.parseLine(null, text, start+textEnd, 2) as MfMText
						textSpan.addContent(innerDelimiter)
						if(references && references.content.length > 0) {
							textSpan.addContent(references)
						}
						return textSpan
					}
					line.content.push(new StringLineContent(']', start+i, 1, result))
					i++	
				}
			} else {
				result.collapse()
			}
	
			this.parsers.MfMOptions.addOptionsTo(result, text, start+i, length-i)
			return result
		}

		return null
	}

	override canUpdate(original: MfMLink | MfMImage, update: ContentUpdate, replacedText: string): boolean {
		for(let c of update.text) {
			switch(c) {
				case '!': case '(': case ')': case '[': case ']': case '"': case "'": case '\\': case '<': case '>': return false
			}
		}
		for(let c of replacedText) {
			switch(c) {
				case '!': case '(': case ')': case '[': case ']': case '"': case "'": case '\\': case '<': case '>': return false
			}
		}
		return super.canUpdate(original, update, replacedText)
	}

	#skipSpaces(text: string, start: number, length: number) {
		let i = 0
		const loop = finiteLoop(() => i, INCREASING)
		while(i < length && isWhitespace(text.charAt(start+i))) {
			loop.guard()
			i++
		}
		return i
	}
}
