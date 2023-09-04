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

import { ParsedLine, StringLineContent } from "../../element/Element"
import { FencedCodeBlock } from "../../element/MarkdownElements"
import { MfMGenericBlock } from "../MfMGenericElement"
import { MfMText, MfMTextParser } from "../inline/MfMText"
import { EMPTY_OPTIONS_PARSER, MfMOptions, MfMOptionsParser, Options } from "../options/MfMOptions"
import { Parser } from "../../parser/Parser"
import { isWhitespace } from "../../parser/isWhitespace"

class MfMFencedCodeOptions extends MfMOptions {
	constructor(private block: MfMFencedCodeBlock, id: string, pw: Parser<MfMOptions>, isFullyParsed: boolean) {
		super(id, pw, isFullyParsed)
	}

	override get keys() {
		const computedKeys: string[] = []
		if(this.block.info) { computedKeys.push('info') }
		if(this.block.lang) { computedKeys.push('default') }

		return [ ...computedKeys, ...super.keys ]
	}
	override get(key: string) {
		if(key === 'default' && this.block.lang) { return this.block.lang }
		if(key === 'info' && this.block.info) { return this.block.info }
		return super.get(key)
	}
}

export class MfMFencedCodeBlock extends MfMGenericBlock<MfMFencedCodeBlock, MfMText, 'fenced-code-block', MfMFencedCodeBlockParser> implements FencedCodeBlock<MfMFencedCodeBlock, MfMText> {
	private emptyBlockOptions = new MfMFencedCodeOptions(this, '__empty__', EMPTY_OPTIONS_PARSER, false)
	info: string | undefined
	lang: string | undefined

	constructor(
		id: string, pw: MfMFencedCodeBlockParser,
		public readonly delimiterCharacter: string, public readonly delimiterLength: number,
		public readonly indent: number
	) { super(id, 'fenced-code-block', pw) }

	override get options(): MfMOptions {
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? this.emptyBlockOptions
	}

	setInfo(info: string, lang: string) {
		this.info = info
		this.lang = lang
	}
}

export class MfMFencedCodeBlockParser extends Parser<MfMFencedCodeBlock, MfMFencedCodeBlock, MfMTextParser | MfMOptionsParser> {
	public readonly elementName = 'MfMFencedCodeBlock'

	parseLine(previous: MfMFencedCodeBlock | null, text: string, start: number, length: number): MfMFencedCodeBlock | null {
		if(previous) {
			return this.parseNextBlockLine(previous, text, start, length)
		}
		return this.parseStartOfBlock(text, start, length)
	}
	
	private parseStartOfBlock(text: string, start: number, length: number): MfMFencedCodeBlock | null {
		let delimiterCharacter: string | undefined
		let delimiterLength = 3
		const indent = this.findIndent(text, start, length)

		if(text.indexOf('```', start+indent) === start+indent) {
			while(delimiterLength < length && text.charAt(start+indent+delimiterLength)==='`') { delimiterLength++ }
			delimiterCharacter = '`'
		} else if(text.indexOf('~~~', start) === start) {
			while(delimiterLength < length && text.charAt(start+indent+delimiterLength)==='~') { delimiterLength++ }
			delimiterCharacter = '~'
		}
		
		if(delimiterCharacter) {
			const result = new MfMFencedCodeBlock(this.parsers.idGenerator.nextId(), this, delimiterCharacter, delimiterLength, indent)

			result.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), result))
			result.lines[result.lines.length-1].content.push(new StringLineContent(text.substring(start, start+indent+delimiterLength), start, indent+delimiterLength, result))

			if(delimiterLength < length) {
				const optionsLength = this.parsers.MfMOptions.addOptionsTo(result, text, start+indent+delimiterLength, length-indent-delimiterLength).parsedLength
				
				if(optionsLength === 0) {
					const info = text.substring(start+indent+delimiterLength, start+length).trim()
					if(delimiterCharacter === '`' && info.indexOf('`') >= 0) {
						return null
					}
					
					const lang = info.split(' ')[0]
					result.setInfo(info, lang)
	
					result.lines[result.lines.length-1].content.push(new StringLineContent(text.substring(start+indent+delimiterLength, start+length), start+indent+delimiterLength, length-indent-delimiterLength, result))
				} else if(indent+delimiterLength+optionsLength < length) {
					result.lines[result.lines.length-1].content.push(new StringLineContent(text.substring(start+indent+delimiterLength+optionsLength, start+length), start+indent+delimiterLength+optionsLength, length-indent-delimiterLength-optionsLength, result))
				}
			}

			return result	
		}

		return null
	}

	private parseNextBlockLine(previous: MfMFencedCodeBlock, text: string, start: number, length: number): MfMFencedCodeBlock | null {
		previous.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), previous))

		const optionsLength = this.parsers.MfMOptions.addOptionsTo(previous, text, start, length).parsedLength
		if(optionsLength > 0 && optionsLength < length) {
			previous.lines[previous.lines.length-1].content.push(new StringLineContent(text.substring(start+optionsLength, start+length), start+optionsLength, length-optionsLength, previous))
		} else if(this.endsCurrent(previous, text, start, length)) {
			previous.lines[previous.lines.length-1].content.push(new StringLineContent(text.substring(start, start+length), start, length, previous))
			previous.continueWithNextLine = false
		} else {
			const currentIndent = this.findSpaces(text, start, length)
			const indentToRemove = Math.min(currentIndent, previous.indent)
			if(indentToRemove > 0) {
				previous.lines[previous.lines.length-1].content.push(new StringLineContent(text.substring(start, start+indentToRemove), start, indentToRemove, previous))
			}
			const textContent = this.parsers.MfMText.parseLine(null, text, start+indentToRemove, length-indentToRemove)
			if(textContent) { previous.addContent(textContent) }
		}

		return previous
	}

	private endsCurrent(previous: MfMFencedCodeBlock, text: string, start: number, length: number) {
		const indent = this.findIndent(text, start, length)
		if(text.charAt(start+indent) === previous.delimiterCharacter) {
			let delimiterLength = 1
			while(delimiterLength < length && text.charAt(start+indent+delimiterLength) === previous.delimiterCharacter) {
				delimiterLength++
			}

			if(delimiterLength >= previous.delimiterLength) {
				let isOnlySpaces = true
				for(let i=indent+delimiterLength; i<length; i++) {
					if(!isWhitespace(text.charAt(start+i))) {
						isOnlySpaces = false
						break
					}
				}
				return isOnlySpaces
			}
		}
		return false
	}

	private findIndent(text: string, start: number, length: number) {
		let spaces = this.findSpaces(text, start, length)
		return spaces > 3? 0 : spaces
	}
	
	private findSpaces(text: string, start: number, length: number) {
		let spaces = 0

		while(spaces < length && text.charAt(start+spaces) === ' ') {
			spaces++
		}

		return spaces
	}
}

