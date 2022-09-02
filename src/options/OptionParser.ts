import { ContentChange } from "$markdown/ContentChange"
import { Option, UpdatableOption } from "$markdown/MarkdownOptions"
import { find } from "$markdown/parser/find"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"

export interface OptionParserConfig {
	allowDefault: boolean,
}
export class OptionParser extends LeafTextParser<Option> implements TextParser<Option> {
	private config: OptionParserConfig

	constructor(config: Partial<OptionParserConfig> = {}) {
		super()

		const defaultConfig: OptionParserConfig = {
			allowDefault: false,
		}
		this.config = {
			...defaultConfig,
			...config,
		}
	}

	parse(text: string, start: number, length: number): ParserResult<Option> | null {
		let i = 0
		const incrementIndex = (l: number) => i+=l

		const identMatcher = /[^ \n\r\t}=;]+/
		const valueMatcher = /[^\n\r}=;]+/
		const ident = find(text, identMatcher, start+i, length-i, incrementIndex)
		if(ident) {
			const equals = find(text, '=', start+i, length-i, incrementIndex)
			if(equals) {
				const value = find(text, valueMatcher, start+i, length-i, incrementIndex)
				if(value) {
					return {
						startIndex: start,
						length: i,
						content: new UpdatableOption(
							text.substring(start, start+i),
							ident.foundText,
							value.foundText.trim(),
							start, i,
							this,
						),
					}
				}
			} else if(this.config.allowDefault) {
				return {
					startIndex: start,
					length: i,
					content: new UpdatableOption(
						text.substring(start, start+i),
						'default',
						ident.foundText,
						start, i,
						this,
					),
				}
			}
		}

		return null
	}
}
