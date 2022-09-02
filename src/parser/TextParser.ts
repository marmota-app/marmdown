import { ContentChange } from "$markdown/ContentChange";
import { AdvancedConent, Content, DefaultContent, Updatable, UpdatableContainer } from "$markdown/MarkdownDocument";

export interface ParserResult<T = (Content & DefaultContent)> {
	startIndex: number,
	length: number,
	content: T,
}

export interface TextParser<T = (Content & DefaultContent & AdvancedConent)> {
	parse(text: string, start: number, length: number): ParserResult<T> | null,
	parsePartial(existing: T, change: ContentChange): ParserResult<T> | null,
}

export abstract class LeafTextParser<T extends Updatable<T>> implements TextParser<T> {
	abstract parse(text: string, start: number, length: number): ParserResult<T> | null

	parsePartial(existing: T, change: ContentChange): ParserResult<T> | null {
		const optionStart = existing.start

		const changeStart = change.rangeOffset
		const changeEnd = change.rangeOffset + change.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= optionStart && changeStart <= optionStart+existing.length
		const rangeEndsWithinExistingBounds = changeEnd >= optionStart && changeEnd <= optionStart+existing.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			const beforeChange = existing.asText.substring(0, changeStart - optionStart)
			const afterChange = existing.asText.substring(changeEnd - optionStart)

			const newText = beforeChange + change.text + afterChange
			const newResult = this.parse(newText, 0, newText.length)
			const newResultWasFullyParsed = (r: ParserResult<T>) => r.length === newText.length

			if(newResult && newResultWasFullyParsed(newResult)) {
				const newContent = newResult.content
				newContent.start = optionStart
				newContent.previous = existing.previous
				newContent.parent = existing.parent
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

export abstract class ContainerTextParser<T extends UpdatableContainer<T, P>, P> extends LeafTextParser<T> {
	parsePartial(existing: T, change: ContentChange): ParserResult<T> | null {
		const optionsStart = existing.start

		const changeStart = change.rangeOffset
		const changeEnd = change.rangeOffset + change.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= optionsStart && changeStart <= optionsStart+existing.length
		const rangeEndsWithinExistingBounds = changeEnd >= optionsStart && changeEnd <= optionsStart+existing.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			for(let i=0; i<existing.parts.length; i++) {
				const affected = existing.parts[i]
				if(affected && (affected as unknown as Updatable<any>).asText != null) {
					const affectedOption = (affected as unknown as Updatable<any>)
					const result = affectedOption.parsedWith.parsePartial(affectedOption, change)
					if(result) {
						existing.parts[i] = result.content
						return {
							startIndex: optionsStart,
							length: existing.length,
							content: existing,
						}
					}
				}
			}
	
			return super.parsePartial(existing, change)
		}

		return null
	}
}
