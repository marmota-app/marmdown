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
	public allOptions = new UpdatableOptions()

	constructor(parsedWith: HeadingParser | undefined) {
		super(parsedWith)
	}

	get hasChanged() { return false }

	get text() { return this.contents.reduce(
		(result: string, content) => {
			const space = result.length > 0? ' ': ''
			return result + space + (content.text? content.text.trim() : '')
		}, '')
	}

	get lines() {
		return this.contents
			.filter(c => c.text != null && c.text.trim() != '')
			.map(c => c.text? c.text.trim() : '')
	}

	get options() {
		return this.allOptions.asMap
	}

	get isFullyParsed(): boolean {
		//This function is not written as a single return with boolean operators because I found
		//that to be hard to read at the time I wrote it.
		if(!this.allOptions.isFullyParsed) {
			return false
		}
		if(this.contents[this.contents.length-1].text?.endsWith('  ')) {
			return false
		}
		return true
	}
}

export class HeadingParser extends ContainerTextParser<string | Options, UpdatableHeading, ParsedHeadingContent> {
	private optionsParser: OptionsParser
	constructor(private parsers: Parsers<'OptionsParser'>) {
		super()
		this.optionsParser = this.parsers.knownParsers()['OptionsParser'] as OptionsParser
	}

	parse(previous: UpdatableHeading | null, text: string, start: number, length: number): [UpdatableHeading | null, ParsedHeadingContent | null] {
		let i = 0
		const heading = this.canUse(previous)? previous : new UpdatableHeading(this)
		const content = new ParsedHeadingContent(start, i)
		const whenFound = (l: number, t: string) => { 
			content.contained.push(new StringContent<UpdatableHeading>(t, i, l, heading))
			i+=l
		}

		if(this.canUse(previous)) {
			if(!previous.allOptions.isFullyParsed) {
				const updatedOptions = this.optionsParser.parse(previous.allOptions, text, start+i, length-i)
				if(updatedOptions[0] && updatedOptions[1]) {
					content.contained.push(updatedOptions[1])
					i += updatedOptions[1].length
					if(i >= length) {
						return [ heading, content, ]
					}
				}
			}
			return this.createHeadingFrom(text, start, length, i, whenFound,
				heading, content)
		} else {
			for(var h=0; h<headingIdentifiers.length; h++) {
				if(find(text, headingIdentifiers[h].text, start+i, length-i, { whenFound })) {
					const optionsResult = this.optionsParser.parse(null, text, start+i, length-i)
					if(optionsResult[0] && optionsResult[1]) {
						content.contained.push(optionsResult[1])
						i += optionsResult[1].length
						heading.allOptions = optionsResult[0] as UpdatableOptions
						if(i >= length) {
							return [ heading, content, ]
						}
					}
					if(i<length && text.charAt(start+i)!=' ' && text.charAt(start+i)!='\t') {
						return [ null, null, ]
					}
					heading.level = headingIdentifiers[h].level

					return this.createHeadingFrom(text, start, length, i, whenFound,
						heading, content)
				}
			}
		}

		return [ null, null, ]
	}

	createHeadingFrom(text: string, start: number, length: number, i: number,
			whenFound: (l: number, t: string)=>unknown,
			heading: UpdatableHeading, content: ParsedHeadingContent,
	): [UpdatableHeading | null, ParsedHeadingContent | null] {
		const whitespaceMatcher = /[ \t]+/y
		whitespaceMatcher.lastIndex = start+i
		const foundWhitespace = whitespaceMatcher.exec(text)
		if(foundWhitespace && foundWhitespace[0].length===(length-i) && foundWhitespace[0].endsWith('  ')) {
			content.text = foundWhitespace[0]
		} else {
			const headingText = find(text, /[^\r\n]+/, start+i, length-i, { whenFound })
			if(headingText != null) {
				content.text = headingText.foundText
			}	
		}

		content.belongsTo = heading
		heading.contents.push(content)

		return [ heading, content, ]
	}

	canUse(previous: UpdatableHeading | null): previous is UpdatableHeading {
		return previous != null && 
			!previous.isFullyParsed
	}
}
