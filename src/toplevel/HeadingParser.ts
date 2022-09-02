import { ContentChange } from "$markdown/ContentChange";
import { AdvancedConent, DefaultContent, Heading, Level as HeadingLevel } from "$markdown/MarkdownDocument";
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { OptionsParser } from "$markdown/options/OptionsParser";
import { find, skipSpaces } from "$markdown/parser/find";
import { ContainerTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser";
import { UpdatableContainerElement } from "$markdown/UpdatableElement";

const headingIdentifiers = [ 
	{ text: '####', level: 4},
	{ text: '###',  level: 3},
	{ text: '##',   level: 2},
	{ text: '#',    level: 1},
] as const

export interface MdHeading extends Heading, DefaultContent, AdvancedConent {
}

export class UpdatableHeading extends UpdatableContainerElement<UpdatableHeading, string | Options> implements MdHeading {
	type = 'Heading' as const

	constructor(public readonly level: HeadingLevel, public readonly allOptions: Options, _parts: (string | Options)[], _start: number, parsedWith: HeadingParser) {
		super(_parts, _start, parsedWith)
	}

	get options() { return this.allOptions.asMap }
	get hasChanged() { return false }
	get text() { return this.parts[this.parts.length-1] as string }
}

export class HeadingParser extends ContainerTextParser<UpdatableHeading, string | Options> implements TextParser<UpdatableHeading> {
	constructor(private optionsParser: OptionsParser = new OptionsParser()) {
		super()
	}

	parse(text: string, start: number, length: number): ParserResult<UpdatableHeading> | null {
		let i = 0
		const parts: (string | Options)[] = []
		const incrementIndex = (l: number, t: string) => { i+=l; parts.push(t) }

		for(var h=0; h<headingIdentifiers.length; h++) {
			if(find(text, headingIdentifiers[h].text, start+i, length-i, incrementIndex)) {
				let options: Options = new UpdatableOptions([], -1, this.optionsParser)
				const optionsResult = this.optionsParser.parse(text, start+i, length-i)
				if(optionsResult) {
					i += optionsResult.length
					options = optionsResult.content
					parts.push(options)
				}
				skipSpaces(text, start+i, length-i, incrementIndex)
				const headingText = find(text, /[^\r\n]+/, start+i, length-i, incrementIndex)
				if(headingText == null) {
					parts.push('')
				}

				return {
					startIndex: start,
					length: i,
					content: new UpdatableHeading(headingIdentifiers[h].level, options, parts, start, this),
				}
			}
		}

		return null
	}
}
