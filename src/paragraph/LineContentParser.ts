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
import { find } from "$markdown/parser/find"
import { ContainerTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { Parsers } from "$markdown/Parsers"
import { UpdatableParagraphContent } from "$markdown/toplevel/ParagraphParser"
import { UpdatableContainerElement } from "$markdown/UpdatableElement"
import { NewlineContentParser, UpdatableNewlineContent } from "./NewlineParser"
import { TextContentParser, UpdatableTextContent } from "./TextContentParser"

export class UpdatableLineContent extends UpdatableContainerElement<UpdatableLineContent, UpdatableParagraphContent> {
	constructor(parts: UpdatableParagraphContent[], _start: number, parsedWith: LineContentParser) {
		super(parts, _start, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this.parts }
}

export const NEW_LINE_CHARS = [ '\r', '\n', '\r\n' ]
export class LineContentParser extends ContainerTextParser<UpdatableLineContent, UpdatableParagraphContent> implements TextParser<UpdatableLineContent> {

	constructor(private parsers: Parsers<'TextContentParser' | 'NewLineParser'>) {
		super()
	}

	parse(text: string, start: number, length: number): ParserResult<UpdatableLineContent> | null {
		const parts: UpdatableParagraphContent[] = []
		let i = 0
		const incrementIndex = (l: number) => i+=l

		const couldBeParsedInToplevel = this.parsers.toplevel()
			.map(dp => dp.couldParse(text, start, length))
			.some(cp => cp)
		if(couldBeParsedInToplevel) { return null }

		const isEmptyLine = find(text, /[\r\n]/, start+i, length-i)
		if(isEmptyLine) { return null }

		const newLineIndex = NEW_LINE_CHARS
			.map(c => text.indexOf(c, i+start))
			.filter(i => i>=0 && i < start+length)
			.reduce((p: number | null, c)=>p? Math.min(p,c) : c, null)

		const textContent = newLineIndex? 
			this.parsers.knownParsers()['TextContentParser'].parse(text, start, newLineIndex-start) :
			this.parsers.knownParsers()['TextContentParser'].parse(text, start, length)
		
		if(textContent) {
			i += textContent.length
			parts.push(textContent.content)
		}

		if(newLineIndex) {
			const newlineContent = this.parsers.knownParsers()['NewLineParser'].parse(text, start+i, length-i)
			if(newlineContent) {
				i += newlineContent.length
				parts.push(newlineContent.content)
			}
		}

		return {
			startIndex: start,
			length: i,
			content: new UpdatableLineContent(parts, start, this),
		}
	}
}
