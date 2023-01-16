import { Element, LineContent, ParsedLine } from "$element/Element";
import { ContentUpdate } from "./ContentUpdate";

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
	parse(element: ELEMENT, update: ContentUpdate): ELEMENT | null {
		if(update.text.indexOf('\r') >= 0 || update.text.indexOf('\n') >= 0) {
			return null
		}

		const originalText = element.lines[0].asText
		const rangeStartWithin = update.rangeOffset - element.lines[0].start
		const beforeChange = originalText.substring(0, rangeStartWithin)
		const afterChange = originalText.substring(rangeStartWithin+update.rangeLength)
		const updatedText = beforeChange + update.text + afterChange

		const updated = element.parsedWith.parseLine(null, updatedText, 0, updatedText.length)

		this.updateStart(updated!.lines[0], element.lines[0].start)
		element.lines[0] = updated!.lines[0]

		return element
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
