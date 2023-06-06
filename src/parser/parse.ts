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

import { Block, Element, LineContent, ParsedLine } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { IdGenerator } from "$markdown/IdGenerator"
import { Parser } from "./Parser"
import { Parsers } from "./Parsers"

export function parseBlock<
	B extends GenericBlock<B, CONTENT, unknown, Parser<B, Element<unknown, unknown, unknown, unknown>>>,
	CONTENT extends Element<unknown, unknown, unknown, unknown>,
>(
	previous: B | null, container: B, text: string, start: number, length: number,
	allBlocks: Parser<any>[],
	idGenerator: IdGenerator,
	optionalCallbacks: { endsPrevious?: (prev: B, c: CONTENT)=>boolean, addLine?: () => void},
): B | null {
	const defaultCallbacks = { endsPrevious: ()=>false, addLine: () => { container.lines.push(new ParsedLine(idGenerator.nextLineId(), container))} }
	const callbacks = { ...defaultCallbacks, ...optionalCallbacks }

	const previousContent = container.content.length > 0? container.content[container.content.length-1] : null
	if(previousContent && !previousContent.isFullyParsed) {
		const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
		const content = parsedWith.parseLine(previousContent, text, start, length)
		if(content) {
			callbacks.addLine()
			if(content as unknown === container) {
				const inner = content.content[content.content.length-1] as Element<unknown, unknown, unknown, unknown>
				const contentLine = inner.lines[inner.lines.length-1] as ParsedLine<unknown, Element<unknown, unknown, unknown, unknown>>
				container.lines[container.lines.length-1].content.push(contentLine)
			} else {
				const contentLine = content.lines[content.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
				container.lines[container.lines.length-1].content.push(contentLine)
			}
			return container
		}
	}
	for(let i=0; i<allBlocks.length; i++) {
		const parser = allBlocks[i]
		const content = parser.parseLine(null, text, start, length) as CONTENT
		if(content) {
			callbacks.addLine()
			if(previous && callbacks.endsPrevious(previous, content)) {
				return null
			}
			container.addContent(content)
			return container
		}
	}

	return null
}

export function parseContainerBlock<
	B extends GenericBlock<B, CONTENT, unknown, Parser<B, Element<unknown, unknown, unknown, unknown>>>,
	CONTENT extends Element<unknown, unknown, unknown, unknown>,
>(
	previous: B | null, container: B, text: string, start: number, length: number,
	allBlocks: Parser<any>[],
	idGenerator: IdGenerator,
	optionalCallbacks: { endsPrevious?: (prev: B, c: CONTENT)=>boolean} = {},
): B | null {
	const defaultCallbacks = { endsPrevious: ()=>false }
	const callbacks = { ...defaultCallbacks, ...optionalCallbacks }

	const previousContent = container.content.length > 0? container.content[container.content.length-1] : null
	if(previousContent && !previousContent.isFullyParsed) {
		const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
		const content = parsedWith.parseLine(previousContent, text, start, length)
		if(content) {
			/*
			callbacks.addLine()
			if(content as unknown === container) {
				const inner = content.content[content.content.length-1] as Element<unknown, unknown, unknown, unknown>
				const contentLine = inner.lines[inner.lines.length-1] as ParsedLine<unknown, Element<unknown, unknown, unknown, unknown>>
				container.lines[container.lines.length-1].content.push(contentLine)
			} else {
				const contentLine = content.lines[content.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
				container.lines[container.lines.length-1].content.push(contentLine)
			}
			*/
			return container
		}
	}
	for(let i=0; i<allBlocks.length; i++) {
		const parser = allBlocks[i]
		const content = parser.parseLine(null, text, start, length) as CONTENT
		if(content) {
			//callbacks.addLine()
			if(previous && callbacks.endsPrevious(previous, content)) {
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
