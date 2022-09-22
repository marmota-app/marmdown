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
import { HeadingParser } from "./toplevel/HeadingParser";
import { AdvancedConent, Content, DefaultContent, MarkdownDocument } from "./MarkdownDocument";
import { Options } from "./MarkdownOptions";
import { OptionsParser } from "./options/OptionsParser";
import { TextParser } from "./parser/TextParser";
import { find } from "./parser/find";
import { ParagraphParser } from "./toplevel/ParagraphParser";
import { FencedCodeBlockParser } from "./toplevel/FencedCodeBlockParser";
import { ThematicBreakParser } from "./toplevel/ThematicBreakParser";

let _documentParsers: TextParser[] | undefined
export const documentParsers: () => TextParser[] = () => {
	if(_documentParsers === undefined) {
		_documentParsers = [
			new HeadingParser(),
			new ThematicBreakParser(),
			new FencedCodeBlockParser(),
			new ParagraphParser(),
		]
	}
	return _documentParsers
}

export class Marmdown {
	private _document: MarkdownDocument

	constructor(initialText: string, private optionsParser: TextParser<Options> = new OptionsParser(), private subparsers: TextParser[] = documentParsers()) {
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

		const currentOptions = this.optionsParser.parse(text, startIndex, length)
		if(currentOptions) {
			options = currentOptions.content

			startIndex = currentOptions.startIndex + currentOptions.length
			length = text.length - currentOptions.startIndex - currentOptions.length
		}

		while(startIndex < text.length) {
			let noResultParsed = true

			for(let i=0; i<this.subparsers.length; i++) {
				if(find(text, /[\r\n]+/, startIndex, length, l => {
					noResultParsed = false
					startIndex += l
					length -= l
				})) { break }
				
				const currentResult = this.subparsers[i].parse(text, startIndex, length)
	
				if(currentResult) {
					noResultParsed = false
					content.push(currentResult.content)

					startIndex = currentResult.startIndex + currentResult.length
					length = text.length - currentResult.startIndex - currentResult.length
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
