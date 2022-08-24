import { AdvancedConent, DefaultContent, Heading } from "$markdown/MarkdownDocument";
import { DEFAULT_OPTIONS, Options } from "$markdown/MarkdownOptions";
import { OptionsParser } from "$markdown/options/OptionsParser";
import { find } from "$markdown/parser/find";
import { ParserResult, TextParser } from "$markdown/parser/TextParser";

const headingIdentifiers = [ 
	{ text: '####', level: 4},
	{ text: '###',  level: 3},
	{ text: '##',   level: 2},
	{ text: '#',    level: 1},
] as const

export class HeadingParser implements TextParser<Heading> {
	constructor(private optionsParser: OptionsParser = new OptionsParser()) {}

	parse(text: string, start: number, length: number): ParserResult<Heading & DefaultContent & AdvancedConent> | null {
		let i = 0
		const incrementIndex = (l: number) => i+=l

		for(var h=0; h<headingIdentifiers.length; h++) {
			if(find(text, headingIdentifiers[h].text, start+i, length-i, incrementIndex)) {
				let options: Options = DEFAULT_OPTIONS
				const optionsResult = this.optionsParser.parse(text, start+i, length-i)
				if(optionsResult) {
					i += optionsResult.length
					options = optionsResult.content
				}
				const headingText = find(text, /[^\r\n]+/, start+i, length-i, incrementIndex)

				return {
					startIndex: start,
					length: i,
					content: {
						allOptions: options,
						type: 'Heading',
						level: headingIdentifiers[h].level,
						text: headingText?.foundText ?? '',
						get options() { return options.asMap },
						hasChanged: false,
					},
				}
			}
		}

		return null
	}
}
