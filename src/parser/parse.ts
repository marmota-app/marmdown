import { Block, Element } from "$element/Element"
import { Parser } from "./Parser"
import { Parsers } from "./Parsers"

export function parseBlock<
	B extends Block<unknown, CONTENT, unknown>,
	CONTENT extends Element<unknown, unknown, unknown, unknown>,
>(
	previous: B | null, text: string, start: number, length: number,
	create: () => B, allBlocks: Parser<any>[], endsPrevious: (prev: B, c: CONTENT)=>boolean = ()=>false,
): B | null {
	const container = previous ?? create()

	const previousContent = container.content.length > 0? container.content[container.content.length-1] : null
	if(previousContent && !previousContent.isFullyParsed) {
		const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
		const content = parsedWith.parseLine(previousContent, text, start, length)
		if(content) {
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
			container.content.push(content)
			return container
		}	
	}

	return null
}
