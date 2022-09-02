import { ContentChange } from "$markdown/ContentChange";
import { Updatable } from "$markdown/MarkdownDocument";
import { ContentOptions, Option, Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { ContainerTextParser, ParserResult, TextParser } from "../parser/TextParser";
import { OptionParser } from "./OptionParser";

export class OptionsParser extends ContainerTextParser<Options, string | Option> implements TextParser<Options> {
	constructor(private defaultOptionParser = new OptionParser({ allowDefault: true, }), private optionParser = new OptionParser()) {
		super()
	}

	parse(text: string, start: number, length: number): ParserResult<Options> | null {
		let i = 0
		const foundParts: (string | Option)[] = []
		const incrementIndex = (l: number, t: string) => { i+=l; foundParts.push(t) }

		const foundOptionsStartIndex = start+i
		if(find(text, '{', start+i, length-i, incrementIndex)) {
			const foundOptions: Option[] = []

			let nextParser = this.defaultOptionParser
			let nextOption: ParserResult<Option> | null
			do {
				nextOption = nextParser.parse(text, start+i, length-i)
				if(nextOption) {
					foundParts.push(nextOption.content)
					foundOptions.push(nextOption.content)
					i += nextOption.length
				}
				find(text, ';', start+i, length-i, incrementIndex)
				nextParser = this.optionParser
			} while(nextOption != null)

			if(find(text, '}', start+i, length-i, incrementIndex)) {
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
