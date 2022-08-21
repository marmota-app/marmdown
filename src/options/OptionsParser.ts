import { ContentOptions, Option, Options } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { ParserResult, TextParser } from "../parser/TextParser";
import { OptionParser } from "./OptionParser";

export class OptionsParser implements TextParser<Options> {
	constructor(private defaultOptionParser = new OptionParser({ allowDefault: true, }), private optionParser = new OptionParser()) {}

	parse(text: string, start: number, length: number): ParserResult<Options> | null {
		let i = 0
		const incrementIndex = (l: number) => i+=l

		if(find(text, '{', start+i, length-i, incrementIndex)) {
			const foundOptions: Options = {
				options: [],
				get asMap() {
					return this.options.reduce((p, c) => {
						return { ...p, [c.key]: c.value}
					}, {} as ContentOptions)
				}
			}

			let nextParser = this.defaultOptionParser
			let nextOption: ParserResult<Option> | null
			do {
				nextOption = nextParser.parse(text, start+i, length-i)
				if(nextOption) {
					foundOptions.options.push(nextOption.content)
					i += nextOption.length
				}
				find(text, ';', start+i, length-i, incrementIndex)
				nextParser = this.optionParser
			} while(nextOption != null)

			if(find(text, '}', start+i, length-i, incrementIndex)) {
				return {
					startIndex: start,
					length: i,
					content: foundOptions,
				}	
			}
		}

		return null
	}
}
