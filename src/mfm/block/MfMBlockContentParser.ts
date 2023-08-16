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

import { Element, LineContent, ParsedLine, StringLineContent } from "../../element/Element"
import { MfMBlockElements } from "../../MfMDialect"
import { MfMGenericContainerBlock, addOptionsToContainerBlock } from "../MfMGenericElement"
import { MfMParser } from "../MfMParser"
import { MfMOptions, MfMOptionsParser } from "../options/MfMOptions"
import { EmptyElement, EmptyElementParser } from "../../parser/EmptyElementParser"
import { Parser } from "../../parser/Parser"

export type MfMBlockElementContent = MfMBlockElements

export abstract class MfMBlockContentParser<
	T extends MfMGenericContainerBlock<T, MfMBlockElementContent, string, P> & { continueWithNextLine: boolean, options: MfMOptions },
	P extends MfMBlockContentParser<T, P>,
> extends MfMParser<T, T, MfMOptionsParser | EmptyElementParser> {
	abstract create(): T
	abstract get token(): string
	abstract get elementName(): string

	parseLine(previous: T | null, text: string, start: number, length: number): T | null {
		if(text.charAt(start) === this.token) {
			let i=this.token.length
			let lineStart: string | null = this.token

			const block = previous ?? this.create()

			const optionsResult = addOptionsToContainerBlock(
				block, text, start+i, length-i, this.parsers, (line, parsedLength) => {
					i += parsedLength
					if(lineStart) { block.attach(line.id, { prepend: new StringLineContent(lineStart, start, lineStart.length, block) }) }
					lineStart = null
				}
			)
			if(optionsResult.lineFullyParsed) {
				return block
			}

			const nextChar = text.charAt(start+i)
			//The parser adds only the first whitespace character to the
			//block itself. The rest of the characters belongs to the inner
			//elements - Otherwise, it would not be possible to have, e.g.,
			//indented code blocks.
			if(lineStart && (nextChar === ' ' || nextChar === '\t')) {
				lineStart = `${this.token}${nextChar}`
				i++
			}

			const previousContent = block.content.length > 0? block.content[block.content.length-1] : null
			if(previous && previousContent && !previousContent.isFullyParsed) {
				const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
				const content = parsedWith.parseLine(previousContent, text, start+i, length-i)
				if(content) {
					if(lineStart) { block.attach(block.lastLine.id, { prepend: new StringLineContent(lineStart, start, lineStart.length, block) }) }
					return block
				}
			}

			for(const contentParser of this.allBlocks) {
				const content = contentParser.parseLine(null, text, start+i, length-i) as MfMBlockElements
				if(content) {
					block.addContent(content);
					if(lineStart) { block.attach(block.lastLine.id, { prepend: new StringLineContent(lineStart, start, lineStart.length, block) }) }
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
