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
import { ParsedDocumentContent, Updatable } from "$markdown/Updatable";

//FIXME remove SkipLineStart completely!
export interface SkipLineStartOptions {
	whenSkipping: (textToSkip: string) => unknown,
}
export type SkipLineStart = (text: string, start: number, length: number, options?: SkipLineStartOptions)=>{ isValidStart: boolean, skipCharacters: number, }
export const defaultSkipLineStart: SkipLineStart = () => ({ isValidStart: true, skipCharacters: 0, })
export interface TextParser<CONTENTS, UPDATABLE_TYPE extends Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT>, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>=ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>> {
	parse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number, skipLineStart?: SkipLineStart): [UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null],
	couldParse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number): boolean,
	parsePartial(existing: UPDATABLE_TYPE, change: ContentChange): UPDATABLE_TYPE | null,
}

export abstract class ContainerTextParser<CONTENTS, UPDATABLE_TYPE extends Updatable<CONTENTS, UPDATABLE_TYPE, DOCUMENT_CONTENT>, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>=ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>> implements TextParser<CONTENTS, UPDATABLE_TYPE> {
	abstract parse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number, skipLineStart?: SkipLineStart): [UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null]

	couldParse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number): boolean {
		return this.parse(previous, text, start, length) != null
	}

	parseSingleContent(contentIndex: number, text: string, start: number, length: number, skipLineStart?: SkipLineStart): [UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null] {
		return this.parse(null, text, start, length)
	}

	parsePartial(existing: UPDATABLE_TYPE, change: ContentChange): UPDATABLE_TYPE | null {
		for(let ci = 0; ci < existing.contents.length; ci++) {
			const current = existing.contents[ci]
			if(current.start < 0) { return null }

			const changeStart = change.rangeOffset
			const changeEnd = change.rangeOffset + change.rangeLength

			const rangeStartsWithingExistingBounds = changeStart >= current.start && changeStart <= current.start+current.length
			const rangeEndsWithinExistingBounds = changeEnd >= current.start && changeEnd <= current.start+current.length

			if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
				const beforeChange = current.asText.substring(0, changeStart - current.start)
				const afterChange = current.asText.substring(changeEnd - current.start)
	
				const newText = beforeChange + change.text + afterChange
				const [newResult, contents] = this.parseSingleContent(ci, newText, 0, newText.length)
				const newResultWasFullyParsed = (r: UPDATABLE_TYPE) => r.contents[0].length === newText.length
	
				if(newResult && contents && newResultWasFullyParsed(newResult)) {
					contents.start = current.start
					contents.parent = current.parent

					const newContents = [ ...existing.contents ]
					newContents[ci] = contents
					newResult.contents = newContents

					return newResult
				}
			}
		}
		/*
		const existingStart = existing.start
		if(existingStart < 0) {
			return null
		}

		const rangeStartsWithingExistingBounds = changeStart >= existingStart && changeStart <= existingStart+existing.length
		const rangeEndsWithinExistingBounds = changeEnd >= existingStart && changeEnd <= existingStart+existing.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			for(let i=0; i<existing.parts.length; i++) {
				const affected = existing.parts[i]
				if(affected && (affected as unknown as Updatable<any>).asText != null) {
					const affectedUpdatable = (affected as unknown as Updatable<any>)

					if(affectedUpdatable.parsedWith == null) return null

					const result = affectedUpdatable.parsedWith.parsePartial(affectedUpdatable, change) as P
					if(result) {
						existing.parts[i] = result
						return existing
					}
				}
			}
	
			return super.parsePartial(existing, change)
		}
		*/
		return null
	}
}
