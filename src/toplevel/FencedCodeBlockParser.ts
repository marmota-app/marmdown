/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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

import { ToUpdatable, PreformattedContent, Preformatted, DefaultContent, AdvancedConent } from "$markdown/MarkdownDocument"
import { Options, UpdatableOption, UpdatableOptions } from "$markdown/MarkdownOptions"
import { OptionsParser } from "$markdown/options/OptionsParser"
import { NEW_LINE_CHARS } from "$markdown/paragraph/LineContentParser"
import { NewlineContentParser } from "$markdown/paragraph/NewlineParser"
import { TextContentParser } from "$markdown/paragraph/TextContentParser"
import { find } from "$markdown/parser/find"
import { ContainerTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { UpdatableContainerElement } from "$markdown/UpdatableElement"

export type UpdatableCodeBlockContent = ToUpdatable<PreformattedContent>

export interface MdPreformatted extends Preformatted, DefaultContent, AdvancedConent {
}

export class UpdatableFencedCodeBlock extends UpdatableContainerElement<UpdatableFencedCodeBlock, UpdatableCodeBlockContent | string> implements MdPreformatted {
	readonly type = 'Preformatted' as const
	
	constructor(public readonly allOptions: Options, _parts: (UpdatableCodeBlockContent | string)[], _start: number, parsedWith: FencedCodeBlockParser) {
		super(_parts, _start, parsedWith)
	}

	get options() { return this.allOptions.asMap }
	get hasChanged() { return false }
	get content() { return this.parts.filter(p => typeof(p) === 'object') as PreformattedContent[] }
}

export class FencedCodeBlockParser extends ContainerTextParser<UpdatableFencedCodeBlock, UpdatableCodeBlockContent | string> implements TextParser<UpdatableFencedCodeBlock> {
	constructor(private textParser = new TextContentParser(), private newlineParser = new NewlineContentParser(), private optionsParser = new OptionsParser()) { super() }

	parse(text: string, start: number, length: number): ParserResult<UpdatableFencedCodeBlock> | null {
		let options: Options = new UpdatableOptions([], -1)

		const parts: (UpdatableCodeBlockContent | string)[] = []
		let i = 0
		const textFound = (l: number, t: string) => { i+=l; parts.push(t) }

		const fence = find(text, /(``[`]+)|(~~[~]+)/, start+i, length-i, textFound)
		if(!fence) {
			return null
		}
		const parsedOptions = this.optionsParser.parse(text, start+i, length-i)
		if(parsedOptions) {
			i += parsedOptions.length
			options = parsedOptions.content
		} else {
			const foundInfo = find(text, /[^\r\n]*/, start+i, length-i, textFound)
			if(foundInfo) {
				const infoString = foundInfo.foundText.trim()
				const language = infoString.split(/[ \t]/)
				options.parts.push(new UpdatableOption(language[0], 'default', language[0], -1, -1))
				options.parts.push(new UpdatableOption(infoString, 'codeBlockInfo', infoString, -1, -1))
			}	
		}

		find(text, /[^\r\n]*(\n|\r\n|$)/, start+i, length-i, textFound)

		while(i < length) {
			if(find(text, new RegExp(`${fence.foundText}[^\\r\\n]*(\\n|\\r\\n|$)`), start+i, length-i, textFound)) {
				break;
			} else if(find(text, /((#+)[ \t\r\n])|((--)-+)|((__)_+)|((\*\*)\*+)/, start+i, length-i)) {
				//FIXME this if should really something like "newSlideParsers.map(couldParse).some(...)" - See LineContentParser for reference!
				break;
			}
			const newLineIndex = NEW_LINE_CHARS
				.map(c => text.indexOf(c, i+start))
				.filter(n => n>=0 && n < start+length)
				.reduce((p: number | null, c)=>p? Math.min(p,c) : c, null)
		
			const textContent = newLineIndex? 
				this.textParser.parse(text, start+i, newLineIndex-start-i) :
				this.textParser.parse(text, start+i, length-i)
			
			if(textContent && textContent.length > 0) {
				i += textContent.length
				parts.push(textContent.content)
			}

			if(newLineIndex) {
				const newlineContent = this.newlineParser.parse(text, start+i, length-i)
				if(newlineContent) {
					i += newlineContent.length
					parts.push(newlineContent.content)
				}
			}
		}

		return {
			startIndex: start,
			length: i,
			content: new UpdatableFencedCodeBlock(options, parts, -1, this)
		}
	}
}
