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
import { ThematicBreak } from "../../element/MarkdownElements"
import { MfMGenericBlock, addOptionsToContainerBlock } from "../MfMGenericElement"
import { MfMParser } from "../MfMParser"
import { MfMOptionsParser } from "../options/MfMOptions"
import { MfMSection, MfMSectionParser } from "./MfMSection"

export class MfMThematicBreak extends MfMGenericBlock<MfMThematicBreak, never, 'thematic-break', MfMThematicBreakParser> implements ThematicBreak<MfMThematicBreak> {
	constructor(id: string, pw: MfMThematicBreakParser) { super(id, 'thematic-break', pw) }
	section?: MfMSection
}

export class MfMThematicBreakParser extends MfMParser<
	MfMThematicBreak, MfMSection,
	MfMOptionsParser | MfMSectionParser
> {
	public readonly elementName = 'MfMThematicBreak'

	override parseLine(previous: MfMThematicBreak | null, text: string, start: number, length: number): MfMSection | null {
		if(previous != null) {
			if(previous.section == null) { throw new Error('found thematic break '+JSON.stringify(previous))+' without seciton, which is not allowed!' }
			if(!previous.options.isFullyParsed) {
				previous.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), previous))
				const optionsLength = this.parsers.MfMOptions.addOptionsTo(previous, text, start, length).parsedLength

				const [ foundWhitespaceOnly, whitespaceLength, ] = this.findWhitespace(text, start+optionsLength, length-optionsLength)
				if(foundWhitespaceOnly) {
					if(whitespaceLength > 0) {
						previous.lines[previous.lines.length-1].content.push(
							new StringLineContent(text.substring(start+optionsLength, start+optionsLength+whitespaceLength),
							start+optionsLength, whitespaceLength, previous))
					}
					return previous.section
				}
			}
			return null
		}
		
		const [ foundThematicBreak, foundLength, ] = this.findThematicBreak(text, start, length)
		if(foundThematicBreak) {
			const thematicBreak = new MfMThematicBreak(this.parsers.idGenerator.nextId(), this)
			thematicBreak.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), thematicBreak))
			thematicBreak.lines[thematicBreak.lines.length-1].content.push(new StringLineContent(text.substring(start, start+foundLength), start, foundLength, thematicBreak))
			let i = foundLength

			i += this.parsers.MfMOptions.addOptionsTo(thematicBreak, text, start+i, length-i).parsedLength

			let level = 1
			if(thematicBreak.options.get('level')) {
				const parsedLevel = parseInt(thematicBreak.options.get('level'))
				if(!isNaN(parsedLevel)) { level = parsedLevel }
			}
			const section = this.parsers.MfMSection.create(level)
			thematicBreak.section = section

			const [ foundWhitespaceOnly, whitespaceLength, ] = this.findWhitespace(text, start+i, length-i)
			if(foundWhitespaceOnly) {
				if(whitespaceLength > 0) {
					thematicBreak.lines[thematicBreak.lines.length-1].content.push(new StringLineContent(text.substring(start+i, start+i+whitespaceLength), start+i, whitespaceLength, thematicBreak))
				}
				section.addContent(thematicBreak)
				return section
			}
		}

		return null
	}

	override parseLineUpdate(original: MfMThematicBreak, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		if(original.section == null) { throw new Error('found thematic break '+JSON.stringify(original))+' without seciton, which is not allowed!' }

		const result = this.parseLine(null, text, start, length)
		if(result && result.level === original.section.level) {
			return result.content[0].lines[0]
		}
		return null
	}

	private findWhitespace(text: string, start: number, length: number): [ boolean, number, ] {
		const searchRegex = new RegExp(`[ \t]+`, 'y')
		searchRegex.lastIndex = start
	
		const findResult = searchRegex.exec(text)
	
		return [ (findResult && findResult[0].length === length) ?? length===0, findResult?.[0].length ?? 0, ]
	}

	private findThematicBreak(text: string, start: number, length: number): [ boolean, number, ] {
		for(const token of [ '\\*', '-', '_', ]) {
			const foundToken = this.findTokenBreak(text, start, length, token)
			if(foundToken[0]) { return foundToken }
		}
		return [ false, 0, ]
	}

	private findTokenBreak(text: string, start: number, length: number, token: string): [ boolean, number, ] {
		const searchRegex = new RegExp(` {0,3}${token}[ \t]*${token}([ \t]*${token})+`, 'y')
		searchRegex.lastIndex = start
	
		const findResult = searchRegex.exec(text)
	
		return [ findResult != null, findResult?.[0].length ?? 0, ]
	}
}
