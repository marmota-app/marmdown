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

import { LineContent, ParsedLine, StringLineContent } from "../../element/Element"
import { HardLineBreak } from "../../element/MarkdownElements"
import { MfMGenericLeafInline } from "../MfMGenericElement"
import { InlineParser } from "../../parser/Parser"

export class MfMHardLineBreak extends MfMGenericLeafInline<MfMHardLineBreak, never, LineContent<MfMHardLineBreak>, 'line-break', MfMHardLineBreakParser> implements HardLineBreak<MfMHardLineBreak> {
	constructor(id: string, pw: MfMHardLineBreakParser) { super(id, 'line-break', pw) }
}

export class MfMHardLineBreakParser extends InlineParser<MfMHardLineBreak, never> {
	public readonly elementName = 'MfMHardLineBreak'

	override parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMHardLineBreak | null {
		if(length < 1) { return null }
		if(length === 1 && text.charAt(start) !== '\\') { return null }
		if(length >= 2) {
			for(let i=0; i<length; i++) {
				if(text.charAt(start+i) !== ' ') { return null }
			}
		}

		const result = new MfMHardLineBreak(this.parsers.idGenerator.nextId(), this)
		const line: ParsedLine<StringLineContent<MfMHardLineBreak>, MfMHardLineBreak> = new ParsedLine(this.parsers.idGenerator.nextLineId(), result)
		line.content.push(new StringLineContent(text.substring(start, start+length), start, length, result))
		result.lines.push(line)
		return result
	}
}
