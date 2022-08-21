import { Option } from "$markdown/MarkdownOptions"
import { find } from "$markdown/parser/find"
import { ParserResult, TextParser } from "$markdown/parser/TextParser"

export interface OptionParserConfig {
	allowDefault: boolean,
}
export class OptionParser implements TextParser<Option> {
	private config: OptionParserConfig

	constructor(config: Partial<OptionParserConfig> = {}) {
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
		const ident = find(text, identMatcher, start+i, length-i, incrementIndex)
		if(ident) {
			const equals = find(text, '=', start+i, length-i, incrementIndex)
			if(equals) {
				const value = find(text, identMatcher, start+i, length-i, incrementIndex)
				if(value) {
					return {
						startIndex: start,
						length: i,
						content: {
							key: ident.foundText,
							value: value.foundText,
						},
					}
				}
			} else if(this.config.allowDefault) {
				return {
					startIndex: start,
					length: i,
					content: {
						key: 'default',
						value: ident.foundText,
					},
				}
			}
		}

		return null
	}

}
