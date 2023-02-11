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

export function parseInlineContent(
	text: string, start: number, length: number,
	container: { addContent: (content: any) => unknown, },
	parsers: Parsers<never>
) {
	if(!parsers.allInlines) { throw new Error(`Cannot parse ${text.substring(start, start+length)} at ${start} because all inline parsers array is not defined`) }

	let i=0
	while(i < length) {
		let contentParsed = false
		for(let p=0; p < parsers.allInlines.length; p++) {
			const parser = parsers.allInlines[p]
			const parsed = parser.parseLine(null, text, start+i, length-i)
			if(parsed) {
				i = length //TODO get parsed length from last parsed line!
				contentParsed = true
				container.addContent(parsed)
				break
			}
		}
		if(!contentParsed) {
			throw Error(`Could not parse content ${text.substring(start, start+length)} with inline parsers`)
		}
	}
}
