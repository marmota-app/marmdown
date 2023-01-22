import { Element, LineContent, ParsedLine } from "$element/Element";
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
	constructor(private idGenerator: IdGenerator = new NumberedIdGenerator()) {}

	parse(element: ELEMENT, update: ContentUpdate): ELEMENT | null {
		if(update.text.indexOf('\r') >= 0 || update.text.indexOf('\n') >= 0) {
			return null
		}

		for(let i=0; i<element.lines.length; i++) {
			const updatedLine = this.parseContent(element.lines[i] as LineContent<Element<unknown, unknown, unknown, unknown>>, update)
			if(updatedLine) {
				element.lines[i] = updatedLine as ParsedLine<unknown, unknown>
				return element
			}
		}

		return null
	}

	private parseContent(content: LineContent<Element<unknown, unknown, unknown, unknown>>, update: ContentUpdate): LineContent<unknown> | null {
		const changeStart = update.rangeOffset
		const changeEnd = update.rangeOffset + update.rangeLength
		const rangeStartsWithingExistingBounds = changeStart >= content.start && changeStart <= content.start+content.length
		const rangeEndsWithinExistingBounds = changeEnd >= content.start && changeEnd <= content.start+content.length

		if(rangeStartsWithingExistingBounds && rangeEndsWithinExistingBounds) {
			if(content instanceof ParsedLine) {
				for(var i=0; i<content.content.length; i++) {
					const innerContent = content.content[i]
					const result = this.parseContent(innerContent, update)
					if(result) {
						content.content[i] = result

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

	private parseInnerContent(content: LineContent<Element<unknown, unknown, unknown, unknown>>, update: ContentUpdate): LineContent<unknown> | null {
		const originalText = content.asText
		const rangeStartWithin = update.rangeOffset - content.start
		const beforeChange = originalText.substring(0, rangeStartWithin)
		const afterChange = originalText.substring(rangeStartWithin+update.rangeLength)
		const updatedText = beforeChange + update.text + afterChange

		const updated = content.belongsTo.parsedWith.parseLineUpdate(content.belongsTo, updatedText, 0, updatedText.length)

		if(updated) {
			let lineFound = false
			for(let i=0; i<content.belongsTo.lines.length; i++) {
				if(content.belongsTo.lines[i] === content) {
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
