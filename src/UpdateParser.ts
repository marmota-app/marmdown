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
import { MfMGenericBlock, MfMGenericContainerBlock } from "$mfm/MfMGenericElement";
import { ContentUpdate } from "./ContentUpdate";
import { IdGenerator, NumberedIdGenerator } from "./IdGenerator";

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
				const updatedLine = this.parseContent(element.lines[i] as LineContent<Element<unknown, unknown, unknown, unknown>>, update)
				if(updatedLine) {
					element.lines[i] = updatedLine as ParsedLine<unknown, unknown>
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

	private parseContent(content: LineContent<Element<unknown, unknown, unknown, unknown>>, update: ContentUpdate): LineContent<unknown> | null {
		const changeStart = update.rangeOffset
		const changeEnd = update.rangeOffset + update.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= content.start && changeStart <= content.start+content.length
		const rangeEndsWithinExistingBounds = changeEnd >= content.start && changeEnd <= content.start+content.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			if(content instanceof ParsedLine && content.belongsTo.parsedWith.canUpdate(content.belongsTo)) {
				if(this.updateCouldChangeElementType(content, update)) {
					//TODO can we solve this without an exception?
					//TODO Also, should we even? Returning an object with the 
					//     result and a boolean would work, but is that really
					//     better? Then we'd have to pass the  boolean up the
					//     call chain correctly, and the code would become more
					//     convoluted.
					//     Also, this is actually an exceptional situation,
					//     from the point-of-view of this code!
					throw new Error('update-would-change-document-structure')
				}
				for(var i=0; i<content.content.length; i++) {
					const innerContent = content.content[i]
					const result = this.parseContent(innerContent, update)
					if(result) {
						content.content[i] = result

						if((content.belongsTo as MfMGenericContainerBlock<any, any, any, any>).reattach) {
							(content.belongsTo as MfMGenericContainerBlock<any, any, any, any>).reattach(
								(result as ParsedLine<unknown, unknown>).originalId,
								(result as ParsedLine<unknown, unknown>).id,
							)
						}

						//TODO we probably need better tests for updating the
						//     start index of all following elements!
						let start = result.start+result.length
						for(var j=i+1; j<content.content.length; j++) {
							this.updateStart(content.content[j], start)
							start += content.content[j].length
						}
						return content
					}
				}
				return this.parseInnerContent(content, update)
			} else {
				return null
			}
		}

		return null
	}

	updateCouldChangeElementType(content: ParsedLine<any, any>, update: ContentUpdate) {
		if(content.belongsTo.type === 'paragraph') {
			//For a paragraph, when there is text inserted at the very beginning
			//of a line, the element type of this line might change: e.g.
			//the update might insert a "#", making the current line a heading.
			//See UpdatesThatChangeElements.spec.ts
			return update.rangeOffset === content.start && update.text.length > 0
		}

		return false
	}

	private parseInnerContent(content: LineContent<Element<unknown, unknown, unknown, unknown>>, update: ContentUpdate): LineContent<unknown> | null {
		const originalText = content.asText
		const rangeStartWithin = update.rangeOffset - content.start
		const beforeChange = originalText.substring(0, rangeStartWithin)
		const afterChange = originalText.substring(rangeStartWithin+update.rangeLength)
		const updatedText = beforeChange + update.text + afterChange

		const updated = content.belongsTo.parsedWith.parseLineUpdate(content.belongsTo, updatedText, 0, updatedText.length, content)
		const isFullyParsed = updated?.length === updatedText.length && 
			content.belongsTo.parsedWith.isFullyParsedUpdate(updated as LineContent<Element<unknown, unknown, unknown, unknown>>, content)

		if(updated && isFullyParsed) {
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
				return null
			}

			this.updateStart(updated, content.start)
			return updated
		}

		return null
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
}
