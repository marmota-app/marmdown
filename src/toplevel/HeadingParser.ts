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
import { AdvancedConent, DefaultContent, Heading, Level as HeadingLevel, Level } from "$markdown/MarkdownDocument";
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { OptionsParser } from "$markdown/options/OptionsParser";
import { find, skipSpaces } from "$markdown/parser/find";
import { ContainerTextParser, TextParser } from "$markdown/parser/TextParser";
import { Parsers } from "$markdown/Parsers";
import { ParsedDocumentContent, StringContent, Updatable } from "$markdown/Updatable";
import { UpdatableElement } from "$markdown/UpdatableElement";

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

class ParsedHeadingContent extends ParsedDocumentContent<UpdatableHeading, string | Options> {
	public text: string | undefined
}

export class UpdatableHeading extends UpdatableElement<UpdatableHeading, string | Options, ParsedHeadingContent> implements MdHeading {
	readonly type = 'Heading' as const
	public level: Level = 1

	constructor(parsedWith: HeadingParser | undefined) {
		super(parsedWith)
	}

	get hasChanged() { return false }

	get text() { return this.contents.reduce((result: string, content) => result + (content.text ?? ''), '') }
}

export class HeadingParser extends ContainerTextParser<string | Options, UpdatableHeading, ParsedHeadingContent> {
	constructor(private parsers: Parsers<'OptionsParser'>) {
		super()
	}

	parse(previous: UpdatableHeading | null, text: string, start: number, length: number): [UpdatableHeading | null, ParsedHeadingContent | null] {
		let i = 0
		const heading = new UpdatableHeading(this)
		const content = new ParsedHeadingContent(start, i)
		const whenFound = (l: number, t: string) => { 
			content.contained.push(new StringContent<UpdatableHeading>(t, i, l, heading))
			i+=l
		}

		for(var h=0; h<headingIdentifiers.length; h++) {
			if(find(text, headingIdentifiers[h].text, start+i, length-i, { whenFound })) {
				const headingText = find(text, /[^\r\n]+/, start+i, length-i, { whenFound })
				if(headingText != null) {
					content.text = headingText.foundText
				}

				content.belongsTo = heading
				heading.level = headingIdentifiers[h].level
				heading.contents.push(content)

				return [ heading, content, ]
			}
		}

		return [ null, null, ]

		/*
		let i = 0
		const parts: (string | Options)[] = []
		const whenFound = (l: number, t: string) => { i+=l; parts.push(t) }

		const skip = skipLineStart(text, start+i, length-1, { whenSkipping: (text)=>parts.push(text) })
		if(!skip.isValidStart) { return null };
		i += skip.skipCharacters

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
		*/
	}
}
