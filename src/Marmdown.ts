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
import { UpdatableOptions } from "./MarkdownOptions";
import { OptionsParser } from "./options/OptionsParser";

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
		const content: GenericUpdatable[] = []

		this.startIndex = 0
		let lastResult: [GenericUpdatable | null, GenericParser | null] = [ null, null, ]

		const options = this.parseDocumentOptions(text)

		while(this.startIndex < text.length) {
			const hadEmptyLine = this.skipEmptyLines(text)

			const nextNL = text.indexOf('\n', this.startIndex)
			const nextCR = text.indexOf('\r', this.startIndex)
			const nextNewline = nextNL < 0? nextCR : ( nextCR < 0? nextNL : Math.min(nextNL, nextCR))

			const nextLength = nextNewline<0? text.length-this.startIndex: nextNewline-this.startIndex;
			this.noResultParsed = true

			if(!hadEmptyLine && lastResult[1]) {
				const currentParser = lastResult[1]

				if(this.tryParse(text, currentParser, lastResult, nextLength, null, lr => lastResult=lr)) {
					this.skipLineEnding(text)
					continue
				}
			}

			for(let toplevelParserIndex=0; toplevelParserIndex<this.allParsers.toplevel().length; toplevelParserIndex++) {
				const currentParser = this.allParsers.toplevel()[toplevelParserIndex]
				
				if(this.tryParse(text, currentParser, [null, null], nextLength, content, lr => lastResult=lr)) {
					this.skipLineEnding(text)
					break
				}
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
			content: content as unknown as (Content&DefaultContent)[],
			options: options.asMap,
		}
	}

	private parseDocumentOptions(text: string): UpdatableOptions {
		const optionsContent: UpdatableOptions[] = []
		let lastResult: [GenericUpdatable | null, GenericParser | null] = [ null, null, ]
		const currentParser = this.allParsers.knownParsers()['OptionsParser'] as OptionsParser

		const hadEmptyLine = this.skipEmptyLines(text)

		const nextNL = text.indexOf('\n', this.startIndex)
		const nextCR = text.indexOf('\r', this.startIndex)
		const nextNewline = nextNL < 0? nextCR : ( nextCR < 0? nextNL : Math.min(nextNL, nextCR))

		const nextLength = nextNewline<0? text.length-this.startIndex: nextNewline-this.startIndex;
		if(this.tryParse(text, currentParser, [null, null], nextLength, optionsContent, lr => lastResult=lr)) {
			this.skipLineEnding(text)
		} else {
			return new UpdatableOptions(currentParser)
		}

		while(this.startIndex < text.length) {
			this.noResultParsed = true

			const hadEmptyLine = this.skipEmptyLines(text)

			const nextNL = text.indexOf('\n', this.startIndex)
			const nextCR = text.indexOf('\r', this.startIndex)
			const nextNewline = nextNL < 0? nextCR : ( nextCR < 0? nextNL : Math.min(nextNL, nextCR))

			const nextLength = nextNewline<0? text.length-this.startIndex: nextNewline-this.startIndex;
			this.noResultParsed = true

			if(!hadEmptyLine && lastResult[1]) {
				const currentParser = lastResult[1]

				if(this.tryParse(text, currentParser, lastResult, nextLength, null, lr => lastResult=lr)) {
					this.skipLineEnding(text)
				}
			}

			if(this.noResultParsed) { break }
		}

		return optionsContent[0]
	}

	private tryParse<LR>(
		text: string,
		currentParser: GenericParser,
		lastResult: [GenericUpdatable | null, GenericParser | null],
		nextLength: number,
		content: GenericUpdatable[] | null,
		setLastResult: (lr: [GenericUpdatable | null, GenericParser | null]) => unknown,
	): boolean {
		const currentResult = currentParser.parse(lastResult[0], text, this.startIndex, nextLength)

		if(currentResult[0] && currentResult[1]) {
			content?.push(currentResult[0])
			setLastResult([ currentResult[0], currentParser, ])
			this.startIndex = currentResult[1].start + currentResult[1].length
			this.noResultParsed = false;
		
			return true;
		}
		return false
	}
	private skipLineEnding(text: string) {
		const current = text.charAt(this.startIndex)
		if(current === '\r') {
			this.startIndex++
			if(text.charAt(this.startIndex) === '\n') {
				this.startIndex++
			}
		} else if(current === '\n') {
			this.startIndex++
		}
	}

	private skipEmptyLines(text: string): boolean {
		let result = false

		const emptyLineRegex = /[\t ]*((\r?\n)|(\r))/y
		emptyLineRegex.lastIndex = this.startIndex
		let match = emptyLineRegex.exec(text)
		while(match) {
			this.startIndex += match[0].length
			
			emptyLineRegex.lastIndex = this.startIndex
			match = emptyLineRegex.exec(text)
			
			result = true
		}
		return result
	}
}
