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

import { Element, LineContent, ParsedLine } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { IdGenerator } from "$markdown/IdGenerator"
import { INCREASING, finiteLoop } from "$markdown/finiteLoop"
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText"
import { InlineParser, Parser } from "./Parser"
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
			return container
		}
	}
	for(let i=0; i<allBlocks.length; i++) {
		const parser = allBlocks[i]
		const content = parser.parseLine(null, text, start, length) as CONTENT
		if(content) {
			if(previous && callbacks.endsPrevious(previous, content)) {
				return null
			}
			container.addContent(content)
			return container
		}
	}

	return null
}

export function parseInlineContent<CONTENTS extends Element<unknown, unknown, unknown, unknown>>(
	text: string, start: number, length: number,
	parsers: Parsers<MfMTextParser>,
	additionalParams: { [key: string]: any } = {}
) {
	if(!parsers.allInlines) { throw new Error(`Cannot parse ${text.substring(start, start+length)} at ${start} because all inline parsers array is not defined`) }
	const foundContents: (CONTENTS | MfMText)[] = []
	let i=0

	const finite = finiteLoop(() => i, INCREASING)
	let textStart = start+i
	let textLength = 0
	let lastChar = ''
	while(i < length) {
		finite.guard()
		const currentChar = text.charAt(start+i)
		//Text content can - but doesn't have to - occur before each
		//other inline content, and also at the very end (see below).
		//For each special character at this point, we must check
		//whether...
		// * it starts an inner inline element
		// * it ends the current element
		// * it belongs to the current text content
		if(isSpecialCharacter(currentChar) && lastChar !== '\\') {
			const endsCurrendResult = additionalParams.endsCurrent?.(start+i, currentChar)
			if(endsCurrendResult?.ended) {
				if(textLength > 0) {
					const textContent = parsers.MfMText.parseLine(null, text, textStart, textLength)
					if(textContent) { foundContents.push(textContent) }
				}
				textLength = 0
				break
			} else if(endsCurrendResult && additionalParams.endsOuter?.(start+i, endsCurrendResult)) {
				if(textLength > 0) {
					const textContent = parsers.MfMText.parseLine(null, text, textStart, textLength)
					if(textContent) { foundContents.push(textContent) }
				}
				textLength = 0
				break
			} else {
				const innerElement = parseInnerInlineElement<CONTENTS>(text, start+i, length-i, parsers, additionalParams)
				if(innerElement != null) {
					if(textLength > 0) {
						const textContent = parsers.MfMText.parseLine(null, text, textStart, textLength)
						if(textContent) { foundContents.push(textContent) }
					}
					textLength = 0

					foundContents.push(innerElement)
					i += innerElement.lines[innerElement.lines.length-1].length
					textStart = start+i
					continue;
				}
			}
		}
		i++
		textLength++
		if(currentChar === '\\' && lastChar === '\\') {
			lastChar = '' //do not count the \\ as an escape character when it was escaped itself!
		} else {
			lastChar = currentChar
		}
	}
	//Text content can occur at the very end (when there is no closing
	//delimiter, so we exited the loop without finding a right-flanking
	//delimiter run)
	if(textLength > 0) {
		const textContent = parsers.MfMText.parseLine(null, text, textStart, textLength)
		if(textContent) { foundContents.push(textContent) }
	}
	return foundContents
}

function isSpecialCharacter(character: string) {
	switch(character) {
		//Emphasis
		case '_': case '*': case '~': return true
		//Code span
		case '`': return true
		//Hard Line Break
		case ' ': case '\\': return true
		//Links
		case '!': case '[': case ']': return true
	}
	return false
}

export function parseInnerInlineElement<T extends Element<unknown, unknown, unknown, unknown>>(
	text: string, start: number, length: number, parsers: Parsers<any>, additionalParams: { [key: string]: any }
): T | null {
	if(parsers.allInnerInlines == null) { return null }

	for(const parser of parsers.allInnerInlines) {
		const parsed = parser instanceof InlineParser?
			parser.parseLine(null, text, start, length, additionalParams) :
			parser.parseLine(null, text, start, length)
		if(parsed) {
			return parsed as T
		}
}
	return null
}
