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
import { Option, Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { Parsers } from "$markdown/Parsers";
import { ContainerTextParser, TextParser } from "../parser/TextParser";

export class OptionsParser extends ContainerTextParser<Options, string | Option> implements TextParser<Options> {
	constructor(private parsers: Parsers<'OptionParser' | 'DefaultOptionParser'>) {
		super()
	}

	parse(previous: Options | null, text: string, start: number, length: number): Options | null {
		let i = 0

		if(previous != null) {
			const foundParts: (string | Option)[] = []
			const whenFound = (l: number, t: string) => { i+=l; foundParts.push(t) }
			const foundOptionsStartIndex = previous.start
	
			let nextParser = this.parsers.knownParsers()['DefaultOptionParser']
			let nextOption: Option | null
			do {
				nextOption = nextParser.parse(null, text, start+i, length-i)
				if(nextOption) {
					foundParts.push(nextOption)
					foundOptions.push(nextOption)
					i += nextOption.length
				}
				find(text, ';', start+i, length-i, { whenFound })
				nextParser = this.parsers.knownParsers()['OptionParser']
			} while(nextOption != null)

			const shouldContinueLF =   i == length-3 && text.startsWith('  \n',   i)
			if(i == length-2 && text.startsWith('  \n',   i)) {
				foundParts.push('  ')
				return new UpdatableOptions(foundParts, foundOptionsStartIndex, this)
			}

			if(find(text, '}', start+i, length-i, { whenFound })) {
				return new UpdatableOptions(foundParts, foundOptionsStartIndex, this)
			}
			//TODO test for return null!
		}

		const foundParts: (string | Option)[] = []
		const whenFound = (l: number, t: string) => { i+=l; foundParts.push(t) }
		if(find(text, '{', start+i, length-i, { whenFound })) {
			const foundOptionsStartIndex = start+i
			const foundOptions: Option[] = []

			let nextParser = this.parsers.knownParsers()['DefaultOptionParser']
			let nextOption: Option | null
			do {
				nextOption = nextParser.parse(null, text, start+i, length-i)
				if(nextOption) {
					foundParts.push(nextOption)
					foundOptions.push(nextOption)
					i += nextOption.length
				}
				find(text, ';', start+i, length-i, { whenFound })
				nextParser = this.parsers.knownParsers()['OptionParser']
			} while(nextOption != null)

			const shouldContinueLF =   i == length-3 && text.startsWith('  \n',   i)
			const shouldContinueCR =   i == length-3 && text.startsWith('  \r',   i)
			const shouldContinueCRLF = i == length-4 && text.startsWith('  \r\n', i)
			if(shouldContinueLF) {
				foundParts.push('  \n')
				return new UpdatableOptions(foundParts, foundOptionsStartIndex, this)
			}
			if(shouldContinueCR) {
				foundParts.push('  \r')
				return new UpdatableOptions(foundParts, foundOptionsStartIndex, this)
			}
			if(shouldContinueCRLF) {
				foundParts.push('  \r\n')
				return new UpdatableOptions(foundParts, foundOptionsStartIndex, this)
			}

			if(find(text, '}', start+i, length-i, { whenFound })) {
				return new UpdatableOptions(foundParts, foundOptionsStartIndex, this)
			}
		}

		return null
	}
}
