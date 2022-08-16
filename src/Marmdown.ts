import { HeadingParser } from "./heading/HeadingParser";
import { Content, DefaultContent, MarkdownDocument } from "./MarkdownDocument";
import { ContentOptions } from "./MarkdownOptions";
import { OptionsParser } from "./options/OptionsParser";
import { TextParser } from "./parser/TextParser";

const documentParsers: TextParser[] = [
	new HeadingParser(),
]

export class Marmdown {
	private _document: MarkdownDocument

	constructor(initialText: string, private optionsParser: TextParser<ContentOptions> = new OptionsParser(), private subparsers: TextParser[] = documentParsers) {
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
