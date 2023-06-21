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

import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element";
import { GenericLeafInline } from "$element/GenericElement";
import { Text } from "$element/MarkdownElements";
import { InlineParser } from "$parser/Parser";

const PUNCTUATION = [ 
	'!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
	':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',
]

export class MfMText extends GenericLeafInline<MfMText, never, StringLineContent<MfMText>, 'text', MfMTextParser> implements Text<MfMText> {
	constructor(id: string, pw: MfMTextParser) { super(id, 'text', pw) }

	get text() { return this.lines.length===1? this.lines[0].content.map(l => l.asText).join('') : '' }
}

export class MfMTextParser extends InlineParser<MfMText> {
	public readonly elementName = 'MfMText'

	parseInline(text: string, start: number, length: number): MfMText | null {
		const result = new MfMText(this.parsers.idGenerator.nextId(), this)

		result.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), result))
		result.lines[0].content.push(new StringLineContent(text.substring(start, start+length), start, length, result))

		return result
	}

	/**
	 * Parse the line update ONLY when the parser can be sure that the result
	 * is still an MfMText. 
	 * 
	 * When punctuation is added to the text, the structure of the element
	 * might change as a result. For example, when an '_' is added in the
	 * middle of some text that is inside an emphasis, the '_' would end
	 * the emphasis and thus split the text.
	 * 
	 * To be on the safe side, this parser **never** tries to parse an
	 * update that contains **any** punctuation.
	 */
	parseLineUpdate(original: MfMText, text: string, start: number, length: number, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>): ParsedLine<unknown, unknown> | null {
		for(const punct of PUNCTUATION) {
			const index = text.indexOf(punct, start)
			if(index >= start && index < start+length) { return null }
		}
		return super.parseLineUpdate(original, text, start, length, originalLine)
	}
}
