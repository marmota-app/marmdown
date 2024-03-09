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

import { MfMBlockElements } from "../../MfMDialect"
import { Element, LineContent, ParsedLine, StringLineContent } from "../../element/Element"
import { ListItem } from "../../element/MarkdownElements"
import { EmptyElementParser } from "../../parser/EmptyElementParser"
import { Parser } from "../../parser/Parser"
import { isEmpty } from "../../parser/find"
import { isWhitespace } from "../../parser/isWhitespace"
import { MfMGenericContainerBlock, addOptionsToContainerBlock } from "../MfMGenericElement"
import { MfMParser } from "../MfMParser"
import { MfMHardLineBreakParser } from "../inline/MfMHardLineBreak"
import { MfMOptionsParser } from "../options/MfMOptions"
import { MfMList, MfMListParser } from "./MfMList"

export type MfMBlockElementContent = MfMBlockElements
export class MfMListItem extends MfMGenericContainerBlock<
	MfMListItem, MfMBlockElementContent, 'list-item', MfMListItemParser
> implements ListItem<MfMListItem, MfMBlockElementContent> {
	protected self: MfMListItem = this
	constructor(id: string, pw: MfMListItemParser, public readonly list: MfMList, public readonly marker: string) { super(id, 'list-item', pw) }
	public indent: number = 0

	public get itemType(): 'plain' | 'task' {
		const firstLineId = this.content[0].lines[0].id
		const prepended = this.attachments[firstLineId]?.prepend as (StringLineContent<unknown> | undefined)
		if(prepended) {
			const bracketIndex = prepended.asText.indexOf('[')
			if(bracketIndex >= 0) {
				return 'task'
			}
		}
		return 'plain'
	}

	public get taskState(): string {
		const firstLineId = this.content[0].lines[0].id
		const prepended = this.attachments[firstLineId]?.prepend as (StringLineContent<unknown> | undefined)
		if(prepended) {
			const text = prepended.asText
			const bracketIndex = text.indexOf('[')
			if(bracketIndex >= 0 && text.charAt(bracketIndex+1)!==']') {
				return text.charAt(bracketIndex+1)
			}
		}
		return ' '
	}
}

export class MfMListItemParser extends MfMParser<MfMListItem, MfMList, MfMOptionsParser | MfMListParser | EmptyElementParser > {
	public readonly elementName = 'MfMListItem'

	parseLine(previous: MfMListItem | null, text: string, start: number, length: number): MfMList | null {
		if(previous != null) {
			if(previous.options.id!=='__empty__' && !previous.options.isFullyParsed) {
				let i=0
				const optionsResult = addOptionsToContainerBlock(
					previous, text, start+i, length-i, this.parsers, {
						onLineAdded: (line, parsedLength) => {
							i += parsedLength
						},
						removeNextWhitespace: false,
					}
				)
				if(optionsResult.lineFullyParsed) {
					return previous.list
				}

				return this.parseContentAfterOptions(text, start, i, length, null, previous, previous.list)
			} else {
				if(isEmpty(text, start, length)) {
					if(previous.content.length === 1 && previous.content[0].type === '--empty--') {
						//A list item can start with **at most** one blank line (GfM Spec!)
						return null
					}

					const previousContent = previous.content[previous.content.length-1]
					const previousParser = previousContent.parsedWith as Parser<typeof previousContent>
					const continued = previousContent.isFullyParsed? null : previousParser.parseLine(previousContent, text, start, length)
					if(continued) { return previous.list }

					const emptyElement = this.parsers.EmptyElement.parseLine(null, text, start, length)
					if(emptyElement) {
						previous.addContent(emptyElement)
						return previous.list
					}
				}
				let spaces = 0
				while(text.charAt(start + spaces) === ' ') {
					spaces++
				}
				if(spaces >= previous.indent) {
					let i = previous.indent
	
					const lineStart = text.substring(start, start+i)
	
					const previousContent = previous.content[previous.content.length-1]
					const previousParser = previousContent.parsedWith as Parser<typeof previousContent>
					const continued = previousContent.isFullyParsed? null : previousParser.parseLine(previousContent, text, start+i, length-i)
					if(continued) {
						if(lineStart) { previous.attach(previous.lastLine.id, { prepend: new StringLineContent(lineStart, start, lineStart.length, previous) }) }
						return previous.list
					} else {
						for(const contentParser of this.allBlocks) {
							const content = contentParser.parseLine(null, text, start+i, length-i) as MfMBlockElements
							if(content) {
								previous.addContent(content);
								if(lineStart) { previous.attach(previous.lastLine.id, { prepend: new StringLineContent(lineStart, start, lineStart.length, previous) }) }
								return previous.list
							}
						}
					}
				}
				return null
			}
		}

		return this.parseNewItem(text, start, length)
	}

	public parseNewItem(text: string, start: number, length: number, previousList?: MfMList) {
		const { marker, listType, spaces } = this.findListType(text, start, length)

		if(listType === 'ordered' || listType === 'bullet') {
			if(previousList) {
				if(previousList.listType !== listType) { return null }
				if(listType === 'ordered') {
					const previousMarkerType = previousList.content[0].marker.substring(previousList.content[0].marker.length-1)
					const markerType = marker.substring(marker.length-1)
					if(previousMarkerType !== markerType) { return null }
				} else if(listType === 'bullet') {
					if(previousList.content[0]?.marker !== marker) { return null}
				}
			}
			const list = previousList ?? this.parsers.MfMList.create(listType)

			const listItem = new MfMListItem(this.parsers.idGenerator.nextId(), this, list, marker)
			list.addContent(listItem)

			let i = marker.length + spaces.length
			let prepend: { start: number, length: number} | null = { start: start, length: spaces.length + marker.length }
			let optionsResult: { lineFullyParsed: boolean, parsedLength: number } | undefined
			if(text.charAt(start+i) === '{') {
				optionsResult = addOptionsToContainerBlock(
					listItem, text, start+i, length-i, this.parsers, {
						onLineAdded: (line, parsedLength) => {
							i += parsedLength
							if(prepend) {
								const prependText = text.substring(prepend.start, prepend.start+prepend.length)
								listItem.attach(line.id, { prepend: new StringLineContent(prependText, prepend.start, prepend.length, listItem) })
								prepend = null
							}
						},
						removeNextWhitespace: false,
					}
				)
				if(optionsResult.lineFullyParsed) {
					return list
				}
			} else {
				listItem.options.isFullyParsed = true
			}

			return this.parseContentAfterOptions(
				text, start, i, length, prepend, listItem, list, spaces.length
			)
		}

		return null
	}

	private parseContentAfterOptions(
		text: string, start: number, i: number, length: number,
		prepend: { start: number, length: number} | null,
		listItem: MfMListItem, list: MfMList, spacesBefore = 0
	) {
		let spaces = 0
		while(text.charAt(start + i + spaces) === ' ') { //TODO isWhitespace?
			spaces++
		}
		if(spaces > 4) { spaces = 1 /* When there are more then four spaces, treat everything after the first space as content */ }
		if(spaces < 1 && !isEmpty(text, start+i, length-i)) { return null }
		prepend = {
			start: prepend?.start ?? (start+i),
			length: (prepend?.length ?? 0) + spaces,
		}
		i += spaces
		if(isEmpty(text, start+i, length-i)) {
			//If the list item is empty, the spaces after the list item do not count as indent (GfM Spec!)
			listItem.indent = listItem.marker.length + 1 + spacesBefore
		} else {
			listItem.indent = listItem.marker.length + spaces + spacesBefore
		}

		// A task list item is a list item that also has [ ], [] or [x] after the bullet or number. There can
		// be any number of spaces before and after the task list marker. When you need options on a task
		// list item, they must come after the task list marker.
		let taskMarkerLength = 0
		if(text.charAt(start+i) === '[' && text.charAt(start+i+2) === ']') {
			taskMarkerLength = 3
		} else if(text.charAt(start+i) === '[' && text.charAt(start+i+1) === ']') {
			taskMarkerLength = 2
		}
		if(taskMarkerLength > 0) {
			i += taskMarkerLength
			spaces = 0

			while(text.charAt(start + i + spaces) === ' ') { //TODO isWhitespace?
				spaces++
			}
			if(spaces > 4) { spaces = 1 /* When there are more then four spaces, treat everything after the first space as content */ }
			if(spaces < 1) { return null }

			prepend = {
				start: prepend?.start ?? (start+i-taskMarkerLength), //FIXME ugly, but works for now. "i-taskMarkerLength" is the start of the task indicator.
				length: (prepend?.length ?? 0)+(taskMarkerLength+spaces),
			}
			i += spaces
		}


		for(const contentParser of this.allBlocks) {
			const content = contentParser.parseLine(null, text, start+i, length-i) as MfMBlockElements
			if(content) {
				listItem.addContent(content);
				if(prepend) {
					const prependText = text.substring(prepend.start, prepend.start+prepend.length)
					listItem.attach(listItem.lastLine.id, { prepend: new StringLineContent(prependText, prepend.start, prepend.length, listItem) })
				}
				break
			}
		}

		return list
	}
	private findListType(text: string, start: number, length: number): { marker: string, listType: 'ordered' | 'bullet' | 'n.a.', spaces: string } {
		let spaces = 0
		while(isWhitespace(text.charAt(start+spaces))) {
			spaces++
		}
		if(spaces > 3) { spaces = 0 }
		const spacesString = spaces > 0? text.substring(start, start+spaces) : ''

		const currentChar = text.charAt(start+spaces)
		switch(currentChar) {
			case '*': case '-': case '+': return { marker: currentChar, listType: 'bullet', spaces: spacesString }
		}

		let digits=0
		while(text.charAt(start+spaces+digits) >= '0' && text.charAt(start+spaces+digits) <= '9') {
			digits++
		}
		if(digits > 0) {
			switch(text.charAt(start+spaces+digits)) {
				case '.': case ')': return { marker: text.substring(start+spaces, start+spaces+digits+1 /* include . or ) */), listType: 'ordered', spaces: spacesString }
			}
		}

		return { marker: '', listType: 'n.a.', spaces: '' }
	}
	
	override parseLineUpdate(original: MfMListItem, text: string, start: number, length: number, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>): ParsedLine<unknown, unknown> | null {
		const result = this.parseLine(null, text, start, length)
		if(result && result.listType === original.list.listType) {
			return result.content[0].lines[0]
		}
		return null
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }

	override shouldInterrupt(element: Element<unknown, unknown, unknown, unknown>, text: string, start: number, length: number): boolean {
		const parsed = this.parseLine(null, text, start, length)
		if(element.type === 'paragraph' && parsed != null) {
			//Ordered lists can only interrupt a paragraph when they start at 1 (GfM Spec!)
			if(parsed.listType === 'ordered' && parsed.orderStart !== 1) { return false }

			const content = parsed.content[0]?.content[0]
			return content != null && content.type !== '--empty--'
		}

		return parsed != null
	}
}
