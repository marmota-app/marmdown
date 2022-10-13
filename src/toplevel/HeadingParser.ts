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
import { ContentChange } from "$markdown/ContentChange";
import { AdvancedConent, DefaultContent, Heading, Level as HeadingLevel } from "$markdown/MarkdownDocument";
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { OptionsParser } from "$markdown/options/OptionsParser";
import { find, skipSpaces } from "$markdown/parser/find";
import { ContainerTextParser, TextParser } from "$markdown/parser/TextParser";
import { Parsers } from "$markdown/Parsers";
import { UpdatableContainerElement } from "$markdown/UpdatableElement";

const headingIdentifiers = [ 
	{ text: '######', level: 6},
	{ text: '#####',  level: 5},
	{ text: '####',   level: 4},
	{ text: '###',    level: 3},
	{ text: '##',     level: 2},
	{ text: '#',      level: 1},
] as const

export interface MdHeading extends Heading, DefaultContent, AdvancedConent {
}

export class UpdatableHeading extends UpdatableContainerElement<UpdatableHeading, string | Options> implements MdHeading {
	readonly type = 'Heading' as const

	constructor(public readonly level: HeadingLevel, public readonly allOptions: Options, _parts: (string | Options)[], _start: number, parsedWith: HeadingParser | undefined) {
		super(_parts, _start, parsedWith)
	}

	get options() { return this.allOptions.asMap }
	get hasChanged() { return false }
	get text() { return this.parts[this.parts.length-1] as string }
}

export class HeadingParser extends ContainerTextParser<UpdatableHeading, string | Options> implements TextParser<UpdatableHeading> {
	constructor(private parsers: Parsers<'OptionsParser'>) {
		super()
	}

	parse(text: string, start: number, length: number): UpdatableHeading | null {
		let i = 0
		const parts: (string | Options)[] = []
		const whenFound = (l: number, t: string) => { i+=l; parts.push(t) }

		for(var h=0; h<headingIdentifiers.length; h++) {
			if(find(text, headingIdentifiers[h].text, start+i, length-i, { whenFound })) {
				let options: Options = new UpdatableOptions([], -1)
				const optionsResult = this.parsers.knownParsers()['OptionsParser'].parse(text, start+i, length-i)
				if(optionsResult) {
					i += optionsResult.length
					options = optionsResult
					parts.push(options)
				} else if(i<length && text.charAt(start+i)!=' ' && text.charAt(start+i)!='\t' && text.charAt(start+i)!='{' && text.charAt(start+i)!='\n' && text.charAt(start+i)!='\r') {
					return null
				}
				
				skipSpaces(text, start+i, length-i, { whenFound })
				const headingText = find(text, /[^\r\n]+/, start+i, length-i, { whenFound })
				if(headingText == null) {
					parts.push('')
				}

				return new UpdatableHeading(headingIdentifiers[h].level, options, parts, start, this)
			}
		}

		return null
	}
}
