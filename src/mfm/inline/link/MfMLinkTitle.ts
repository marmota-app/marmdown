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

import { StringLineContent } from "../../../element/Element"
import { GenericLeafInline } from "../../../element/GenericElement"
import { LinkTitle } from "../../../element/MarkdownElements"
import { ContentUpdate } from "../../../ContentUpdate"
import { isUnescaped, replaceEscaped } from "../../../escaping"
import { INCREASING, finiteLoop } from "../../../finiteLoop"
import { InlineParser } from "../../../parser/Parser"

export class MfMLinkTitle extends GenericLeafInline<MfMLinkTitle, never, StringLineContent<MfMLinkTitle>, 'link-title', MfMLinkTitleParser> implements LinkTitle<MfMLinkTitle> {
	constructor(id: string, pw: MfMLinkTitleParser) { super(id, 'link-title', pw) }

	get value() { return this.lines[0].content.length === 3? replaceEscaped(this.lines[0].content[1].asSafeText) : '' }
}

const DELIMITERS: [string, string][] = [
	[ '"', '"' ],
	[ "'", "'" ],
	[ '(', ')' ],
]
export class MfMLinkTitleParser extends InlineParser<MfMLinkTitle, never> {
	public readonly elementName = 'MfMLinkTitle'

	parseInline(text: string, start: number, length: number): MfMLinkTitle | null {
		for(let di=0; di < DELIMITERS.length; di++) {
			const startingDelimiter = DELIMITERS[di][0]
			const endingDelimiter = DELIMITERS[di][1]

			if(text.charAt(start) === startingDelimiter) {
				let textLength = 0
				const loop = finiteLoop(() => textLength, INCREASING)
				let previousChar = ''
				let currentChar = text.charAt(start+1+textLength)
				while((textLength+1) < length && !isUnescaped([ endingDelimiter ], currentChar, previousChar)) {
					textLength++
					previousChar = currentChar
					currentChar = text.charAt(start+1+textLength)
				}
				if(currentChar !== endingDelimiter) { return null }

				const linkTitle = new MfMLinkTitle(this.parsers.idGenerator.nextId(), this)
				const line = linkTitle.addLine(this.parsers.idGenerator.nextLineId())
		
				line.content.push(new StringLineContent(text.substring(start, start+1), start, 1, linkTitle))
				if(textLength > 0) {
					line.content.push(new StringLineContent(text.substring(start+1, start+1+textLength), start+1, textLength, linkTitle))
				}
				line.content.push(new StringLineContent(text.substring(start+1+textLength, start+textLength+2), start+1+textLength, 1, linkTitle))
		
				return linkTitle
			}
		}

		return null
	}

	override canUpdate(original: MfMLinkTitle, update: ContentUpdate, replacedText: string): boolean {
		for(let c of update.text) {
			for(let i=0; i<DELIMITERS.length; i++) {
				if(c === DELIMITERS[i][0] || c === DELIMITERS[i][1] || c === '\\') { return false }
			}
		}
		for(let c of replacedText) {
			for(let i=0; i<DELIMITERS.length; i++) {
				if(c === DELIMITERS[i][0] || c === DELIMITERS[i][1] || c === '\\') { return false }
			}
		}

		return super.canUpdate(original, update, replacedText)
	}

}

