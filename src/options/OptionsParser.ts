import { ContentOptions, Options } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { ParserResult, TextParser } from "../parser/TextParser";
import { OptionParser } from "./OptionParser";

export class OptionsParser implements TextParser<Options> {
	constructor(private defaultOptionParser = new OptionParser({ allowDefault: true, }), private optionParser = new OptionParser()) {}

	parse(text: string, start: number, length: number): ParserResult<Options> | null {
		/*
		let i = 0
		const incrementIndex = (l: number) => i+=l

		if(find(text, '{', start+i, length-i, incrementIndex)) {
			const foundOptions: ContentOptions = {}

			const identMatcher = /[^ \t\\=\\}\\;\r\n]+/
			const ident = find(text, identMatcher, start+i, length-i, incrementIndex)
			if(ident) {
				const equals = find(text, '=', start+i, length-i, incrementIndex)
				if(equals) {
					const value = find(text, identMatcher, start+i, length-i, incrementIndex)
					if(value) {
						foundOptions[ident.foundText] = value.foundText
					}
				} else {
					foundOptions['default'] = ident.foundText
				}
			}

			if(find(text, '}', start+i, length-i, incrementIndex)) {
				return {
					startIndex: start,
					length: i,
					content: foundOptions,
				}	
			}
		}
		*/
		return null
	}
}
