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
import { Updatable } from "$markdown/MarkdownDocument";
import { ContentOptions, Option, Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { Parsers } from "$markdown/Parsers";
import { ContainerTextParser, ParserResult, TextParser } from "../parser/TextParser";
import { OptionParser } from "./OptionParser";

export class OptionsParser extends ContainerTextParser<Options, string | Option> implements TextParser<Options> {
	//private defaultOptionParser = new OptionParser({ allowDefault: true, }), private optionParser = new OptionParser()
	constructor(private parsers: Parsers<'OptionParser' | 'DefaultOptionParser'>) {
		super()
	}

	parse(text: string, start: number, length: number): ParserResult<Options> | null {
		let i = 0
		const foundParts: (string | Option)[] = []
		const whenFound = (l: number, t: string) => { i+=l; foundParts.push(t) }

		const foundOptionsStartIndex = start+i
		if(find(text, '{', start+i, length-i, { whenFound })) {
			const foundOptions: Option[] = []

			let nextParser = this.parsers.knownParsers()['DefaultOptionParser']
			let nextOption: ParserResult<Option> | null
			do {
				nextOption = nextParser.parse(text, start+i, length-i)
				if(nextOption) {
					foundParts.push(nextOption.content)
					foundOptions.push(nextOption.content)
					i += nextOption.length
				}
				find(text, ';', start+i, length-i, { whenFound })
				nextParser = this.parsers.knownParsers()['OptionParser']
			} while(nextOption != null)

			if(find(text, '}', start+i, length-i, { whenFound })) {
				return {
					startIndex: start,
					length: i,
					content: new UpdatableOptions(foundParts, foundOptionsStartIndex, this),
				}	
			}
		}

		return null
	}
}
