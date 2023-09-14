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

import { MfMGenericLeafInline } from "../MfMGenericElement"
import { ListTask } from "../../element/MarkdownElements"
import { InlineParser } from "../../parser/Parser"
import { LineContent, ParsedLine, StringLineContent } from "../../element/Element"
import { MfMOptionsParser } from "../options/MfMOptions"

export class MfMListTask extends MfMGenericLeafInline<MfMListTask, never, LineContent<MfMListTask>, 'list-task', MfMListTaskParser> implements ListTask<MfMListTask> {
	constructor(id: string, pw: MfMListTaskParser) { super(id, 'list-task', pw) }

	get done() : boolean {
		return this.lines[0]?.content[0]?.asText?.charAt(1) === 'x'
	}
}

export class MfMListTaskParser extends InlineParser<MfMListTask, MfMOptionsParser> {
	public readonly elementName = 'MfMListTask'

	override parseInline(text: string, start: number, length: number, additionalParams: { [key: string]: any } = {}): MfMListTask | null {
		const first = text.charAt(start)
		const middle = text.charAt(start+1)
		const third = text.charAt(start+2)
		if(first === '[' && (third === ']' || middle === ']')) {
			if((middle === ' ' || middle === 'x')) {
				const result = new MfMListTask(this.parsers.idGenerator.nextId(), this)
				result.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), result))
				result.lines[0].content.push(new StringLineContent(text.substring(start, start+3), start, 3, result))
	
				const options = this.parsers.MfMOptions.parseLine(null, text, start+3, length-3)
				if(options && options.isFullyParsed) {
					result.lines[0].content.push(options.lines[0])
				}
	
				return result	
			} else if(middle === ']') {
				const result = new MfMListTask(this.parsers.idGenerator.nextId(), this)
				result.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), result))
				result.lines[0].content.push(new StringLineContent(text.substring(start, start+2), start, 2, result))
	
				const options = this.parsers.MfMOptions.parseLine(null, text, start+2, length-2)
				if(options && options.isFullyParsed) {
					result.lines[0].content.push(options.lines[0])
				}
	
				return result	
			}
		}

		return null
	}
}
