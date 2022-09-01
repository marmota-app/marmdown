import { ContentChange } from "$markdown/ContentChange"
import { Option, UpdatableOption } from "$markdown/MarkdownOptions"
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

	parsePartial(existingOption: Option, change: ContentChange): ParserResult<Option> | null {
		const optionStart = existingOption.start

		const changeStart = change.rangeOffset
		const changeEnd = change.rangeOffset + change.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= optionStart && changeStart <= optionStart+existingOption.length
		const rangeEndsWithinExistingBounds = changeEnd >= optionStart && changeEnd <= optionStart+existingOption.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			const beforeChange = existingOption.asText.substring(0, changeStart - optionStart)
			const afterChange = existingOption.asText.substring(changeEnd - optionStart)

			const newText = beforeChange + change.text + afterChange
			const newResult = this.parse(newText, 0, newText.length)
			const newResultWasFullyParsed = (r: ParserResult<Option>) => r.length === newText.length

			if(newResult && newResultWasFullyParsed(newResult)) {
				const newContent = newResult.content
				newContent.start = optionStart
				newContent.previous = existingOption.previous
				newContent.parent = existingOption.parent
				return {
					length: newResult.length,
					startIndex: optionStart,
					content: newContent,
				}
			}
		}
		return null
	}
}
