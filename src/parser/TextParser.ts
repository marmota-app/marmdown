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

export interface TextParser<CONTENTS, UPDATABLE_TYPE extends Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT>, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>=ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>> {
	parse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number): [UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null],
	couldParse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number): boolean,
	parsePartial(existing: UPDATABLE_TYPE, change: ContentChange): [ UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null ],
}

export abstract class ContainerTextParser<CONTENTS, UPDATABLE_TYPE extends Updatable<CONTENTS, UPDATABLE_TYPE, DOCUMENT_CONTENT>, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>=ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>> implements TextParser<CONTENTS, UPDATABLE_TYPE> {
	abstract parse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number): [UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null]

	couldParse(previous: UPDATABLE_TYPE | null, text: string, start: number, length: number): boolean {
		return this.parse(previous, text, start, length) != null
	}

	parseSingleContent(contentIndex: number, text: string, start: number, length: number): DOCUMENT_CONTENT | null {
		return this.parse(null, text, start, length)[1]
	}

	parsePartial(existing: UPDATABLE_TYPE, change: ContentChange): [ UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null ] {
		for(let ci = 0; ci < existing.contents.length; ci++) {
			const current = existing.contents[ci]
			if(current.start < 0) { return [ null, null, ] }

			const changeStart = change.rangeOffset
			const changeEnd = change.rangeOffset + change.rangeLength

			const rangeStartsWithingExistingBounds = changeStart >= current.start && changeStart <= current.start+current.length
			const rangeEndsWithinExistingBounds = changeEnd >= current.start && changeEnd <= current.start+current.length

			if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
				if(current.contained.length > 0) {
					return this.parseContentChangeInContained(existing, current, ci, change.text, changeStart, changeEnd, change)
				}
				return this.parseContentChangeCompletely(existing, current, ci, change.text, changeStart, changeEnd)
			}
		}
		return [ null, null, ]
	}

	private parseContentChangeInContained(existing: UPDATABLE_TYPE, _current: DOCUMENT_CONTENT, currentIndex: number, changeText: string, changeStart: number, changeEnd: number, change: ContentChange): [ UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null ] {
		for(let ci = 0; ci < _current.contained.length; ci++) {
			const contained = _current.contained[ci]
			if(contained.start >= 0) {
				const rangeStartsWithingExistingBounds = changeStart >= contained.start && changeStart <= contained.start+contained.length
				const rangeEndsWithinExistingBounds = changeEnd >= contained.start && changeEnd <= contained.start+contained.length
	
				if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds &&
						contained.belongsTo && contained.belongsTo !== existing && contained.belongsTo.parsedWith) {
					const [ newUpdatable, newContained ] = contained.belongsTo.parsedWith.parsePartial(contained.belongsTo, change)
					if(newUpdatable != null && newContained != null) {
						_current.contained[ci] = newContained
						return [ existing, _current, ]
					}
				}
			}
		}

		return this.parseContentChangeCompletely(existing, _current, currentIndex, changeText, changeStart, changeEnd)
	}

	private parseContentChangeCompletely(existing: UPDATABLE_TYPE, current: DOCUMENT_CONTENT, currentIndex: number, changeText: string, changeStart: number, changeEnd: number): [ UPDATABLE_TYPE | null, DOCUMENT_CONTENT | null ] {
		const beforeChange = current.asText.substring(0, changeStart - current.start)
		const afterChange = current.asText.substring(changeEnd - current.start)

		const newText = beforeChange + changeText + afterChange
		const contents = this.parseSingleContent(currentIndex, newText, 0, newText.length)
		const newResultWasFullyParsed = (c: DOCUMENT_CONTENT) => c.length === newText.length

		if(contents && newResultWasFullyParsed(contents)) {
			contents.start = current.start
			contents.parent = current.parent
			contents.belongsTo = existing

			existing.contents[currentIndex] = contents

			return [ existing, contents, ]
		}
		return [ null, null, ]
	}
}
