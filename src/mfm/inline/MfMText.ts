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

import { ParsedLine, StringLineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { Text } from "$element/MarkdownElements";
import { InlineParser } from "$parser/Parser";

export class MfMText extends GenericInline<MfMText, never, StringLineContent<MfMText>, 'text', MfMTextParser> implements Text<MfMText> {
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
}
