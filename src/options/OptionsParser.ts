import { ContentChange } from "$markdown/ContentChange";
import { Updatable } from "$markdown/MarkdownDocument";
import { ContentOptions, Option, Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { find } from "$markdown/parser/find";
import { ParserResult, TextParser } from "../parser/TextParser";
import { OptionParser } from "./OptionParser";

export class OptionsParser implements TextParser<Options> {
	constructor(private defaultOptionParser = new OptionParser({ allowDefault: true, }), private optionParser = new OptionParser()) {}

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
					content: new UpdatableOptions(foundParts, foundOptionsStartIndex, i, this),
				}	
			}
		}

		return null
	}

	parsePartial(existing: Options, change: ContentChange): ParserResult<Options> | null {
		const optionStart = existing.start

		const changeStart = change.rangeOffset
		const changeEnd = change.rangeOffset + change.rangeLength
		//const rangeStartsWithingExistingBounds = changeStart >= optionStart && changeStart <= optionStart+existing.length
		//const rangeEndsWithinExistingBounds = changeEnd >= optionStart && changeEnd <= optionStart+existing.length

		//if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			for(let i=0; i<existing.parts.length; i++) {
				const affected = existing.parts[i]
				if(affected && (affected as Updatable<any>).text != null) {
					const affectedOption = (affected as Updatable<any>)
					const result = affectedOption.parsedWith.parsePartial(affectedOption, change)
					if(result) {
						existing.parts[i] = result.content
						return {
							startIndex: 0,//TODO
							length: 0,//TODO
							content: existing, //FIXME must also change existing.options before returning! Or: dynamically create options!
						}
					}
				}
			}
	
			//FIXME: Duplicated from OptionParser!
			const beforeChange = existing.text.substring(0, changeStart - optionStart)
			const afterChange = existing.text.substring(changeEnd - optionStart)

			const newText = beforeChange + change.text + afterChange

			const newResult = this.parse(newText, 0, newText.length)
			const newResultWasFullyParsed = (r: ParserResult<Options>) => r.length === newText.length

			if(newResult && newResultWasFullyParsed(newResult)) {
				const newContent = newResult.content
				//newContent.start = optionStart
				//newContent.previous = existing.previous
				//newContent.parent = existing.parent
				return {
					length: 0,//newResult.length,
					startIndex: 0,//optionStart,
					content: newContent,
				}
			}

		//}

		return null
	}

}
