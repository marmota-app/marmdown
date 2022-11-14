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
import { GenericContent, GenericParser, GenericUpdatable, Parsers } from "./Parsers";
import { MfMParsers } from "./MfMParsers";

export class Marmdown {
	private _document: MarkdownDocument
	private startIndex: number = 0
	private noResultParsed: boolean = true
	

	constructor(initialText: string, private allParsers: Parsers<'OptionsParser'> = new MfMParsers()) {
		this._document = this.parseFullDocument(initialText)
	}

	get document(): MarkdownDocument {
		return this._document
	}

	private parseFullDocument(text: string): MarkdownDocument {
		const content: (Content&DefaultContent)[] = []
		let options = {}

		this.startIndex = 0
		let lastResult: [GenericUpdatable | null, GenericParser | null] = [ null, null, ]

		while(this.startIndex < text.length) {
			const nextNewline = text.indexOf('\n', this.startIndex) //TODO Math.min with \r? -> Test
			const nextLength = nextNewline<0? text.length-this.startIndex: nextNewline-this.startIndex;
			this.noResultParsed = true

			if(lastResult[1]) {
				const currentParser = lastResult[1]

				if(this.tryParse(text, currentParser, lastResult, nextLength, lr => lastResult=lr)) { continue }
			}

			for(let toplevelParserIndex=0; toplevelParserIndex<this.allParsers.toplevel().length; toplevelParserIndex++) {
				const currentParser = this.allParsers.toplevel()[toplevelParserIndex]
				
				if(this.tryParse(text, currentParser, [null, null], nextLength, lr => lastResult=lr)) { break }
			}

			if(this.noResultParsed) break;
		}

		/*

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
		*/
		return {
			content,
			options,
		}
	}

	private tryParse(
		text: string,
		currentParser: GenericParser,
		lastResult: [GenericUpdatable | null, GenericParser | null],
		nextLength: number,
		setLastResult: (lr: [GenericUpdatable | null, GenericParser | null]) => unknown,
	): boolean {
		const currentResult = currentParser.parse(lastResult[0], text, this.startIndex, nextLength)

		if(currentResult[1]) {
			setLastResult([ currentResult[0], currentParser, ])
			this.startIndex = currentResult[1].start + currentResult[1].length
			this.noResultParsed = false;
	
			while(text.charAt(this.startIndex)==='\n') { // TODO \r! -> Test
				this.startIndex++
			}
	
			return true;
		}
		return false
	}
	}
