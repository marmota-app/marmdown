/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
import { ContentChange } from "$markdown/ContentChange";
import { AdvancedConent, Content, DefaultContent, Updatable, UpdatableContainer } from "$markdown/MarkdownDocument";

export interface SkipLineStartOptions {
	whenSkipping: (textToSkip: string) => unknown,
}
export type SkipLineStart = (text: string, start: number, length: number, options?: SkipLineStartOptions)=>{ isValidStart: boolean, skipCharacters: number, }
export const defaultSkipLineStart: SkipLineStart = () => ({ isValidStart: true, skipCharacters: 0, })
export interface TextParser<T extends Updatable<T>> {
	parse(text: string, start: number, length: number, skipLineStart?: SkipLineStart): T | null,
	couldParse(text: string, start: number, length: number): boolean,
	parsePartial(existing: T, change: ContentChange): T | null,
}

export abstract class LeafTextParser<T extends Updatable<T>> implements TextParser<T> {
	abstract parse(text: string, start: number, length: number, skipLineStart?: SkipLineStart): T | null

	couldParse(text: string, start: number, length: number): boolean {
		return this.parse(text, start, length) != null
	}

	parsePartial(existing: T, change: ContentChange): T | null {
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
			const newResultWasFullyParsed = (r: T) => r.length === newText.length

			if(newResult && newResultWasFullyParsed(newResult)) {
				newResult.start = optionStart
				newResult.previous = existing.previous
				newResult.parent = existing.parent
				return newResult
			}
		}
		return null
	}
}

export abstract class ContainerTextParser<T extends UpdatableContainer<T, P>, P> extends LeafTextParser<T> {
	parsePartial(existing: T, change: ContentChange): T | null {
		const existingStart = existing.start
		if(existingStart < 0) {
			return null
		}

		const changeStart = change.rangeOffset
		const changeEnd = change.rangeOffset + change.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= existingStart && changeStart <= existingStart+existing.length
		const rangeEndsWithinExistingBounds = changeEnd >= existingStart && changeEnd <= existingStart+existing.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			for(let i=0; i<existing.parts.length; i++) {
				const affected = existing.parts[i]
				if(affected && (affected as unknown as Updatable<any>).asText != null) {
					const affectedUpdatable = (affected as unknown as Updatable<any>)

					if(affectedUpdatable.parsedWith == null) return null

					const result = affectedUpdatable.parsedWith.parsePartial(affectedUpdatable, change)
					if(result) {
						existing.parts[i] = result
						return existing
					}
				}
			}
	
			return super.parsePartial(existing, change)
		}

		return null
	}
}
