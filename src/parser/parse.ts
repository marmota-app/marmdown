import { Block, Element, LineContent, ParsedLine } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Parser } from "./Parser"
import { Parsers } from "./Parsers"

export function parseBlock<
	B extends GenericBlock<B, CONTENT, unknown, Parser<B, Element<unknown, unknown, unknown, unknown>>>,
	CONTENT extends Element<unknown, unknown, unknown, unknown>,
>(
	previous: B | null, text: string, start: number, length: number,
	create: () => B, allBlocks: Parser<any>[], endsPrevious: (prev: B, c: CONTENT)=>boolean = ()=>false,
): B | null {
	if(previous) { previous.lines.push(new ParsedLine(previous)) }

	const container = previous ?? create()

	const previousContent = container.content.length > 0? container.content[container.content.length-1] : null
	if(previous && previousContent && !previousContent.isFullyParsed) {
		const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
		const content = parsedWith.parseLine(previousContent, text, start, length)
		if(content) {
			if(content as unknown === container) {
				const inner = content.content[content.content.length-1] as Element<unknown, unknown, unknown, unknown>
				const contentLine = inner.lines[inner.lines.length-1] as ParsedLine<unknown, Element<unknown, unknown, unknown, unknown>>
				previous.lines[previous.lines.length-1].content.push(contentLine)
			} else {
				const contentLine = content.lines[content.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
				previous.lines[previous.lines.length-1].content.push(contentLine)
			}
			return container
		}
	}
	for(let i=0; i<allBlocks.length; i++) {
		const parser = allBlocks[i]
		const content = parser.parseLine(null, text, start, length) as CONTENT
		if(content) {
			if(previous && endsPrevious(previous, content)) {
				return null
			}
			container.addContent(content)
			return container
		}	
	}

	return null
}
