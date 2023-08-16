/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

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

import { Element, LineContent, ParsedLine } from "$element/Element";
import { MfMGenericContainerBlock } from "$mfm/MfMGenericElement";
import { ContentUpdate } from "./ContentUpdate";
import { IdGenerator } from "./IdGenerator";

type UpdateResult = { line: LineContent<unknown>, directUpdate: boolean } | { line: null }

/**
 * Parses updates to a document. 
 * 
 * When a document is edited, the editor can create {@link ContentUpdate}
 * objects that describe the update of the content. This `update` contains
 * some new text, the start of the change (`rangeOffset`) and how many
 * characters of the document should be replaced (`rangeLength`).
 * 
 * Updates that span multiple lines are not processed. So, if the update
 * contains a newline character, the parser can immediately bail out: It
 * returns null, which triggers a complete re-parse of the document at a
 * higher level.
 * 
 * The update parser must now first find the affected line of the document:
 * It goes through all lines of the outer element and tries to find a line
 * where the update can be completely parsed within that line. If no such
 * line exists (because the update spans multiple lines), the parser bails
 * out again.
 * 
 * When a line was found, the parser tries to go down the line-content tree
 * recursively, until it finds the smallest {@link Element} where the update
 * can be fitted completely within it's {@link ParsedLine} content. It then
 * uses the `parsedWith` parser of that element to parse the new line content.
 * Then it recreates the new element tree.
 */
export class UpdateParser<ELEMENT extends Element<unknown, unknown, unknown, unknown>> {
	//TODO is it dangerous to set the id generator to a default value here?
	//     That default value must never be used in production!
	constructor(private idGenerator: IdGenerator) {}

	parse(element: ELEMENT, update: ContentUpdate): ELEMENT | null {
		if(update.text.indexOf('\r') >= 0 || update.text.indexOf('\n') >= 0) {
			return null
		}

		try {
			for(let i=0; i<element.lines.length; i++) {
				const updatedResult = this.parseContent(element.lines[i] as LineContent<Element<unknown, unknown, unknown, unknown>>, update)
				if(updatedResult.line) {
					element.lines[i] = updatedResult.line as ParsedLine<unknown, unknown>
					return element
				}
			}
	
			return null
		} catch(e) {
			if((e as Error).message === 'update-would-change-document-structure') {
				return null
			}
			throw e
		}
	}

	private parseContent(content: LineContent<Element<unknown, unknown, unknown, unknown>>, update: ContentUpdate): UpdateResult {
		const changeStart = update.rangeOffset
		const changeEnd = update.rangeOffset + update.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= content.start && changeStart <= content.start+content.length
		const rangeEndsWithinExistingBounds = changeEnd >= content.start && changeEnd <= content.start+content.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			const startInsideContent = update.rangeOffset-content.start
			const replacedText = content.asText.substring(startInsideContent, startInsideContent+update.rangeLength)
			if(content instanceof ParsedLine && content.belongsTo.parsedWith.canUpdate(content.belongsTo, update, replacedText)) {
				if(this.updateCouldChangeElementType(content, update)) {
					throw new Error('update-would-change-document-structure')
				}
				for(var i=0; i<content.content.length; i++) {
					const innerContent = content.content[i]
					const result = this.parseContent(innerContent, update)
					if(result.line) {
						content.content[i] = result.line

						if((content.belongsTo as MfMGenericContainerBlock<any, any, any, any>).reattach) {
							(content.belongsTo as MfMGenericContainerBlock<any, any, any, any>).reattach(
								(result.line as ParsedLine<unknown, unknown>).originalId,
								(result.line as ParsedLine<unknown, unknown>).id,
							)
						}

						let start = result.line.start+result.line.length
						for(var j=i+1; j<content.content.length; j++) {
							this.updateStart(content.content[j], start)
							start += content.content[j].length
						}

						if(result.directUpdate) {
							content.belongsTo.childrenChanged?.()
						}
						return { line: content, directUpdate: false }
					}
				}
				return this.parseInnerContent(content, update)
			} else {
				return { line: null }
			}
		}

		return { line: null }
	}

	updateCouldChangeElementType(content: ParsedLine<any, any>, update: ContentUpdate) {
		if(content.belongsTo.type === 'paragraph') {
			//For a paragraph, when there is text inserted at the very beginning
			//of a line, the element type of this line might change: e.g.
			//the update might insert a "#", making the current line a heading.
			//See UpdatesThatChangeElements.spec.ts
			return update.rangeOffset === content.start && update.text.length > 0
		} else if(content.belongsTo.type === 'link-reference') {
			return true
		} else if(content.belongsTo.classification === 'block') {
			//When the indentation changes, i.e. when the text before the update
			//consists only of spaces AND the update consists only of space, that
			//might change the document structure (e.g. it could change a paragraph
			//into an indented code block or vice-versa or...)
			const startInsideContent = update.rangeOffset-content.start
			const textBefore = content.asText.substring(0, startInsideContent)
			const replacedText = content.asText.substring(startInsideContent, startInsideContent+update.rangeLength)
			const charAfterReplacedText = content.asText.charAt(startInsideContent+update.rangeLength)

			return this.isSpacesOnly(textBefore) && (
				(update.text.length > 0 && this.isSpacesOnly(update.text)) //Did add spaces
				|| (replacedText.length > 0 && replacedText.charAt(0)===' ') //Did replace at least some spaces
				|| (update.rangeLength === 0 && charAfterReplacedText === ' ') //Did remove some text, where the char after the removed text is a space
			)
		}

		return false
	}

	private parseInnerContent(content: LineContent<Element<unknown, unknown, unknown, unknown>>, update: ContentUpdate): UpdateResult {
		const originalText = content.asText
		const rangeStartWithin = update.rangeOffset - content.start
		const beforeChange = originalText.substring(0, rangeStartWithin)
		const afterChange = originalText.substring(rangeStartWithin+update.rangeLength)
		const updatedText = beforeChange + update.text + afterChange

		const updated = content.belongsTo.parsedWith.parseLineUpdate(content.belongsTo, updatedText, 0, updatedText.length, content) as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, Element<unknown, unknown, unknown, unknown>>
		const isFullyParsed = updated?.length === updatedText.length && 
			content.belongsTo.parsedWith.isFullyParsedUpdate(updated as LineContent<Element<unknown, unknown, unknown, unknown>>, content)

		if(updated && isFullyParsed && updated.belongsTo.type === content.belongsTo.type) {
			//Set the ID of the parsed line, or `undefined` if it's not a ParsedLine
			updated.originalId = (content as ParsedLine<unknown, unknown>).id

			let lineFound = false
			for(let i=0; i<content.belongsTo.lines.length; i++) {
				if(content.belongsTo.lines[i] === content) {
					this.updateContentOwner(updated as ParsedLine<LineContent<unknown>, unknown>, content.belongsTo)
					content.belongsTo.lines[i] = updated
					content.belongsTo.id = this.idGenerator.nextId()
					lineFound = true
					break;
				}
			}
			if(!lineFound) {
				console.warn('Could not parse update: Line was not found in original element!')
				return { line: null }
			}

			this.updateStart(updated, content.start)
			return { line: updated, directUpdate: true }
		}

		return { line: null }
	}

	private updateContentOwner(updated: ParsedLine<LineContent<unknown>, unknown>, newOwner: Element<unknown, unknown, unknown, unknown>) {
		updated.content
			.filter(c => c.belongsTo === updated.belongsTo)
			.forEach(c => c.belongsTo = newOwner)
	}

	private updateStart(lineContent: LineContent<unknown>, start: number) {
		if(lineContent instanceof ParsedLine) {
			let startIndex = start
			lineContent.content.forEach((lc: LineContent<unknown>) => {
				this.updateStart(lc, startIndex)
				startIndex += lc.length
			})
		} else {
			lineContent.start = start
		}
	}

	private isSpacesOnly(text: string) {
		for(let i=0; i<text.length; i++) {
			if(text.charAt(i) !== ' ') { return false }
		}
		return true
	}
}
