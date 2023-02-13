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

import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { MfMBlockElements } from "$markdown/MfMDialect"
import { Parser } from "$parser/Parser"

export type MfMBlockElementContent = MfMBlockElements

export abstract class MfMBlockContentParser<
	T extends GenericBlock<T, MfMBlockElementContent, string, P> & { continueWithNextLine: boolean, },
	P extends MfMBlockContentParser<T, P>,
> extends Parser<T> {
	abstract create(): T
	abstract get token(): string
	abstract get elementName(): string

	parseLine(previous: T | null, text: string, start: number, length: number): T | null {
		if(text.charAt(start) === this.token) {
			let i=1
			let lineStart = this.token
			const nextChar = text.charAt(start+1)
			if(nextChar === ' ' || nextChar === '\t') { 
				i++
				lineStart += nextChar
			}

			const block = previous ?? this.create()
			block.lines.push(new ParsedLine(block))
			block.lines[block.lines.length-1].content.push(new StringLineContent(lineStart, start, i, block))

			const previousContent = block.content.length > 0? block.content[block.content.length-1] : null
			if(previous && previousContent && !previousContent.isFullyParsed) {
				const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
				const content = parsedWith.parseLine(previousContent, text, start+i, length-i)
				if(content) {
					const contentLine = content.lines[content.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
					previous.lines[previous.lines.length-1].content.push(contentLine)
					return block
				}
			}
		

			for(const contentParser of this.allBlocks) {
				const content = contentParser.parseLine(null, text, start+i, length-i) as MfMBlockElements
				if(content) {
					block.addContent(content)
					break
				}
			}

			return block
		}

		if(previous) {
			previous.continueWithNextLine = false
		}
		return null
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }
}