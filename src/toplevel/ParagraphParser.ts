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
import { AdvancedConent, DefaultContent, Paragraph, ParagraphContent, TextContent } from "$markdown/MarkdownDocument";
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions";
import { ContainerTextParser, TextParser } from "$markdown/parser/TextParser";
import { Parsers } from "$markdown/Parsers";
import { ParsedDocumentContent, StringContent } from "$markdown/Updatable";
import { UpdatableElement } from "$markdown/UpdatableElement";


export interface MdParagraph extends Paragraph, DefaultContent, AdvancedConent {
}
type ParaContent = string | Options

class ParsedParagraphContent extends ParsedDocumentContent<UpdatableParagraph, ParaContent> {
}
class ParsedTextContent extends ParsedDocumentContent<UpdatableParagraph, unknown> implements TextContent {
	public readonly type = 'Text'

	constructor(public text: string, start: number, private _length: number, belongsTo: UpdatableParagraph) {
		super(start, belongsTo)
	}
	override get length(): number {
		return this._length
	}

	public get content() {
		return this.text.substring(this.start, this._length)
	}
}

export class UpdatableParagraph extends UpdatableElement<UpdatableParagraph, ParaContent, ParsedParagraphContent> implements MdParagraph {
	readonly type = 'Paragraph' as const
	public allOptions = new UpdatableOptions()
	
	constructor(parsedWith: ParagraphParser) {
		super(parsedWith)
	}

	get hasChanged() { return false }
	get content(): ParagraphContent[] { return this.contents
		.flatMap(c => c.contained as unknown as ParagraphContent)
	}
	get isFullyParsed(): boolean { return true }
}

const emptyLineDelimiters = [
	/([^\n]*)(\n[ \t]*\n)/,
	/([^\n]*)(\r\n[ \t]*\r\n)/,
	/([^\n]*)(\n[ \t]*\r\n)/,
	/([^\n]*)(\r\n[ \t]*\n)/,
]

export class ParagraphParser extends ContainerTextParser<ParaContent, UpdatableParagraph, ParsedParagraphContent> {
	constructor(
		private parsers: Parsers<'OptionsParser' /*| 'LineContentParser'*/>
	) {
		super()
	}

	parse(previous: UpdatableParagraph | null, text: string, start: number, length: number): [UpdatableParagraph | null, ParsedParagraphContent | null, ] {
		const paragraph = new UpdatableParagraph(this)

		const content = new ParsedParagraphContent(start)
		content.belongsTo = paragraph
		content.contained.push(new ParsedTextContent(text, start, length, paragraph))
		paragraph.contents.push(content)

		return [ paragraph, content, ]
		/*
		let i = 0
		const parts: (UpdatableLineContent | string)[] = []
		const content: UpdatableLineContent[] = []
		let options: Options = new UpdatableOptions([], -1)

		while((i) < length) {
			const skip = skipLineStart(text, start+i, length-1, { whenSkipping: (text)=>parts.push(text) })
			if(!skip.isValidStart) { break };
			i += skip.skipCharacters

			const line = this.parsers.knownParsers()['LineContentParser'].parse(text, i+start, length-i)

			if(!line) {
				//un-skip skipped chars because we did not find the correct content inside this line!
				i -= skip.skipCharacters
				break
			}

			i += line.length
			parts.push(line)
			content.push(line)
		}

		return new UpdatableParagraph(options, content, parts, start, this)
		*/
	}
}
