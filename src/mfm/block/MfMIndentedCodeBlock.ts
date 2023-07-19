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

import { ParsedLine, StringLineContent } from "$element/Element";
import { IndentedCodeBlock } from "$element/MarkdownElements";
import { MfMGenericBlock } from "$mfm/MfMGenericElement";
import { MfMText, MfMTextParser } from "$mfm/inline/MfMText";
import { Parser } from "$parser/Parser";
import { isEmpty } from "$parser/find";

export class MfMIndentedCodeBlock extends MfMGenericBlock<MfMIndentedCodeBlock, MfMText, 'indented-code-block', MfMIndentedCodeBlockParser> implements IndentedCodeBlock<MfMIndentedCodeBlock, MfMText> {
	constructor(id: string, pw: MfMIndentedCodeBlockParser) { super(id, 'indented-code-block', pw) }
}

export class MfMIndentedCodeBlockParser extends Parser<MfMIndentedCodeBlock, MfMIndentedCodeBlock, MfMTextParser> {
	public readonly elementName = 'MfMIndentedCodeBlock'

	parseLine(previous: MfMIndentedCodeBlock | null, text: string, start: number, length: number): MfMIndentedCodeBlock | null {
		if(text.indexOf('    ', start) === start) {
			if(isEmpty(text, start, length) && previous === null) { return null }

			const codeBlock = this.usePreviousOrCreate(previous)
			codeBlock.lines[codeBlock.lines.length-1].content.push(new StringLineContent('    ', start, 4, codeBlock))

			const textContent = this.parsers.MfMText.parseLine(null, text, start+4, length-4)
			if(textContent != null) {
				codeBlock.addContent(textContent)
			}
	
			return codeBlock
		} else if((previous!=null && isEmpty(text, start, length)) && this.continuesAfterEmptyLine(text, start+length)) {
			previous.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), previous))
			previous.lines[previous.lines.length-1].content.push(new StringLineContent(text.substring(start, start+length), start, length, previous))
			const textContent = this.parsers.MfMText.parseLine(null, text, start+length-1, 0) as MfMText
			previous.addContent(textContent)

			return previous
		}
		return null
	}
	usePreviousOrCreate(previous: MfMIndentedCodeBlock | null) {
		const codeBlock = previous ?? new MfMIndentedCodeBlock(this.parsers.idGenerator.nextId(), this)
		codeBlock.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), codeBlock))
		return codeBlock
	}
	continuesAfterEmptyLine(text: string, startIndex: number) {
		let i = startIndex
		let indent = 0
		let nextChar = text.charAt(i)

		while(i < text.length && nextChar === ' ' || nextChar === '\t' || nextChar === '\r' || nextChar === '\n') {
			if(nextChar === '\t') { indent = -1 }
			if(nextChar === '\r' || nextChar === '\n') { indent = 0 }
			if(nextChar === ' ' && indent >= 0) { indent++ }

			i++
			nextChar = text.charAt(i)
		}

		return indent >= 4
	}
}
