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
import { Option, Options, ParsedOptionsContent, UpdatableOptions } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { Parsers } from "$markdown/Parsers";
import { ParsedDocumentContent } from "$markdown/Updatable";
import { ContainerTextParser, } from "../parser/TextParser";

export class OptionsParser extends ContainerTextParser<string | Option, Options, ParsedOptionsContent> {
	constructor(private parsers: Parsers<'OptionParser' | 'DefaultOptionParser'>) {
		super()
	}

	parse(previous: Options | null, text: string, start: number, length: number): [ Options | null, ParsedOptionsContent | null ] {
		if(!this.canExtendPreviousOptions(previous)) {
			return [null, null, ]
		}

		const parsingOptions = previous != null?
			previous :
			new UpdatableOptions([], this)

		const parsedContent = this.parseSingleContent(parsingOptions.contents.length, text, start, length)

		if(parsedContent) {
			parsingOptions.contents.push(parsedContent)

			return [ parsingOptions, parsedContent, ]
		}

		return [ null, null, ]
	}

	parseSingleContent(contentIndex: number, text: string, start: number, length: number): ParsedOptionsContent | null {
		const foundOptions: Option[] = []
		const foundContents: ParsedDocumentContent<string | Option, unknown>[] = []

		let i = 0
		const whenFound = (l: number, t: string) => { foundContents.push({ start: start+i, length: l, contained: [], asText: t, }), i+=l; }
		if(contentIndex>0 || find(text, '{', start+i, length-i, { whenFound })) {
			let nextParser = contentIndex==0? this.parsers.knownParsers()['DefaultOptionParser']: this.parsers.knownParsers()['OptionParser']
			let nextOption: Option | null
			let nextContent: ParsedDocumentContent<unknown, unknown> | null
			do {
				[ nextOption, nextContent, ] = nextParser.parse(null, text, start+i, length-i)
				if(nextOption && nextContent) {
					foundContents.push(nextContent)
					foundOptions.push(nextOption)
					i += nextOption.contents[0].length
				}
				find(text, ';', start+i, length-i, { whenFound })
				nextParser = this.parsers.knownParsers()['OptionParser']
			} while(nextOption != null)

			const shouldContinue =   i == length-2 && text.startsWith('  ', start+i)
			if(shouldContinue) {
				foundContents.push({ start: start+i, length: 2, contained: [], asText: '  ', })
				const content = { lineOptions: foundOptions, start: start, length: i+2, contained: foundContents, asText: foundContents.map(c => c.asText).join(''), }
				return content
			}

			if(find(text, '}', start+i, length-i, { whenFound })) {
				const content = { lineOptions: foundOptions, start: start, length: i, contained: foundContents, asText: foundContents.map(c => c.asText).join(''), }
				return content
			}
		}
		return null
	}

	private canExtendPreviousOptions(previous: Options | null) {
		if(previous) {
			//was previous fully parsed or can it be extended?
			const lastLine = previous.contents[previous.contents.length - 1]
			const lastContent = lastLine.contained[lastLine.contained.length - 1]
			if(lastContent && lastContent.asText.endsWith('}')) {
				//found a closing curly bracket, so the previous option is already completely parsed!
				return false
			}
		}
		return true
	}
}
