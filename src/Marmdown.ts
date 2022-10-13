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
import { Content, DefaultContent, MarkdownDocument } from "./MarkdownDocument";
import { find } from "./parser/find";
import { Parsers } from "./Parsers";
import { MfMParsers } from "./MfMParsers";

export class Marmdown {
	private _document: MarkdownDocument

	constructor(initialText: string, private allParsers: Parsers<'OptionsParser'> = new MfMParsers()) {
		this._document = this.parseFullDocument(initialText)
	}

	get document(): MarkdownDocument {
		return this._document
	}

	private parseFullDocument(text: string): MarkdownDocument {
		let startIndex = 0;
		let length = text.length;
		const content: (Content&DefaultContent)[] = []
		let options = {}

		const currentOptions = this.allParsers.knownParsers()['OptionsParser'].parse(text, startIndex, length)
		if(currentOptions) {
			options = currentOptions

			startIndex = currentOptions.start + currentOptions.length
			length = text.length - currentOptions.start - currentOptions.length
		}

		while(startIndex < text.length) {
			let noResultParsed = true

			for(let i=0; i<this.allParsers.toplevel().length; i++) {
				const whenFound = (l: number) => {
					noResultParsed = false
					startIndex += l
					length -= l
				}
				if(find(text, /[\r\n]+/, startIndex, length, { whenFound })) { break }
				
				const currentResult = this.allParsers.toplevel()[i].parse(text, startIndex, length)
	
				if(currentResult) {
					noResultParsed = false
					content.push(currentResult)

					startIndex = currentResult.start + currentResult.length
					length = text.length - currentResult.start - currentResult.length
					break;
				}
			}
	
			if(noResultParsed) break;
		}

		return {
			content,
			options,
		}
	}
}
