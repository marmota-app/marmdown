/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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
import { AdvancedConent, DefaultContent, Paragraph, ParagraphContent, TextContent, ToUpdatable } from "$markdown/MarkdownDocument";
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { OptionsParser } from "$markdown/options/OptionsParser";
import { LineContentParser, UpdatableLineContent } from "$markdown/paragraph/LineContentParser";
import { NewlineContentParser } from "$markdown/paragraph/NewlineParser";
import { TextContentParser, UpdatableTextContent } from "$markdown/paragraph/TextContentParser";
import { ContainerTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser";
import { Parsers } from "$markdown/Parsers";
import { UpdatableContainerElement, UpdatableElement } from "$markdown/UpdatableElement";


export type UpdatableParagraphContent = ToUpdatable<ParagraphContent>

export interface MdParagraph extends Paragraph, DefaultContent, AdvancedConent {
}

const PARAGRAPH_PARSERS = {
}

export class UpdatableParagraph extends UpdatableContainerElement<UpdatableParagraph, UpdatableLineContent> implements MdParagraph {
	readonly type = 'Paragraph' as const
	
	constructor(public readonly allOptions: Options, _parts: (UpdatableLineContent)[], _start: number, parsedWith: ParagraphParser) {
		super(_parts, _start, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this.parts.map(p => p.content).flat() }
}

const emptyLineDelimiters = [ /([^\n]*)(\n[ \t]*\n)/, /([^\n]*)(\r\n[ \t]*\r\n)/, /([^\n]*)(\n[ \t]*\r\n)/, /([^\n]*)(\r\n[ \t]*\n)/ ]

export class ParagraphParser extends ContainerTextParser<UpdatableParagraph, UpdatableLineContent> implements TextParser<UpdatableParagraph> {
	constructor(
		private parsers: Parsers<'OptionsParser' | 'LineContentParser'>
	) {
		super()
	}

	couldParse(text: string, start: number, length: number): boolean {
		return false
	}

	parse(text: string, start: number, length: number): ParserResult<UpdatableParagraph> | null {
		let i = 0
		const parts: UpdatableLineContent[] = []
		let options: Options = new UpdatableOptions([], -1)

		type EmptyLine = { index: number, delimiter: string }
		const findEmptyLine: (r: RegExp)=>EmptyLine | null = d => {
			const searchRegex = new RegExp(d, 'y')
			searchRegex.lastIndex = start
			const findResult = searchRegex.exec(text)
	 
			if(findResult) {
				return { index: start+findResult[1].length, delimiter: findResult[2], }
			}
			return null
		}
		const filterEmptyLine = (c: EmptyLine | null) => c != null && c.index >= 0 && c.index < start+length

		const nextEmptyLine: EmptyLine | null = emptyLineDelimiters
			.map(findEmptyLine)
			.filter(filterEmptyLine)
			.reduce((p: EmptyLine | null, c: EmptyLine | null) => {
				if(p) {
					if(c) {
						return c.index < p.index? p : c
					}
					return p
				}
				return c
			}, null)

		const parseLength = nextEmptyLine? nextEmptyLine.index-start : length

		while((i) < parseLength) {
			const line = this.parsers.knownParsers()['LineContentParser'].parse(text, i+start, parseLength-i)

			if(!line) break

			i += line.length
			parts.push(line.content)
		}

		return {
			startIndex: start,
			length: i,
			content: new UpdatableParagraph(options, parts, i, this),
		}
	}
}
