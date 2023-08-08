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

import { ParsedLine, StringLineContent } from "$element/Element"
import { GenericContainerInline } from "$element/GenericElement"
import { LinkText } from "$element/MarkdownElements"
import { ContentUpdate } from "$markdown/ContentUpdate"
import { MfMInlineElements } from "$markdown/MfMDialect"
import { InlineParser } from "$parser/Parser"
import { parseInlineContent } from "$parser/parse"
import { MfMTextParser } from "../MfMText"

export class MfMLinkText extends GenericContainerInline<MfMLinkText, MfMInlineElements, StringLineContent<MfMLinkText>, 'link-text', MfMLinkTextParser> implements LinkText<MfMLinkText, MfMInlineElements> {
	constructor(id: string, pw: MfMLinkTextParser) { super(id, 'link-text', pw) }

	get normalized(): string {
		const innerText = this.content.map(c => c.lines[0].asSafeText).join('')
		const normalizedText = innerText.trim().replaceAll(/[ \t]+/g, ' ')
		return normalizedText
	}
}

export class MfMLinkTextParser extends InlineParser<MfMLinkText, MfMTextParser> {
	public readonly elementName = 'MfMLinkText'

	parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMLinkText | null {
		let textEnd: number | undefined

		const endsCurrent = (searchIndex: number, currentChar: string) => {
			if(currentChar === ']') {
				textEnd = searchIndex
				return { ended: true }
			}
			return { ended: false }
		}
		const endsOuter = (searchIndex: number, delimiting: {}) => {
			return text.charAt(searchIndex) === ']'
		}
		const additionalParametersForInner = {
			...additionalParams,
			endsCurrent,
			endsOuter,
		}

		const foundContents: MfMInlineElements[] = parseInlineContent<MfMInlineElements>(
			text, start, length, this.parsers, additionalParametersForInner
		)

		const linkText = new MfMLinkText(this.parsers.idGenerator.nextId(), this)
		linkText.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), linkText))

		foundContents.forEach(c => linkText.addContent(c))

		return linkText
	}

	override canUpdate(original: MfMLinkText, update: ContentUpdate, replacedText: string): boolean {
		if(update.text.indexOf('[') >= 0) { return false }
		if(update.text.indexOf(']') >= 0) { return false }
		return super.canUpdate(original, update, replacedText)
	}
}
