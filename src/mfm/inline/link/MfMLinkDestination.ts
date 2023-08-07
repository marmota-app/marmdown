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
import { GenericLeafInline } from "$element/GenericElement"
import { LinkDestination } from "$element/MarkdownElements"
import { ContentUpdate } from "$markdown/ContentUpdate"
import { isUnescaped, replaceEscaped } from "$markdown/escaping"
import { INCREASING, finiteLoop } from "$markdown/finiteLoop"
import { InlineParser } from "$parser/Parser"
import { isUnescapedWhitespace } from "$parser/isWhitespace"

export class MfMLinkDestination extends GenericLeafInline<MfMLinkDestination, never, StringLineContent<MfMLinkDestination>, 'link-destination', MfMLinkDestinationParser> implements LinkDestination<MfMLinkDestination> {
	constructor(id: string, pw: MfMLinkDestinationParser) { super(id, 'link-destination', pw) }

	get target() {
		const line = this.lines[0]
		if(line.content.length > 1) {
			return replaceEscaped(line.content[1].asText)
		}
		return replaceEscaped(line.content[0].asText)
	}
}

export class MfMLinkDestinationParser extends InlineParser<MfMLinkDestination, never> {
	public readonly elementName = 'MfMLinkDestination'

	parseInline(text: string, start: number, length: number): MfMLinkDestination | null {
		const firstChar = text.charAt(start)
		switch(firstChar) {
			case '"': case "'": case '(': return null
		}

		if(firstChar === '<') {
			const [ unescapedTarget, i ] = this.findTarget(
				text, start+1, length-1,
				(current, previous) => !isUnescaped(['<', '>'], current, previous)
			)
			if(text.charAt(start+1+i) === '>') {
				return this.createDestination(
					unescapedTarget, start+1,
					(destination) => new StringLineContent('<', start, 1, destination),
					(destination) => new StringLineContent('>', start+1+unescapedTarget.length, 1, destination),
				)
			}
		} else {
			const [ unescapedTarget ] = this.findTarget(
				text, start, length,
				(current, previous) => !isUnescaped(['(', ')'], current, previous) && !isUnescapedWhitespace(current, previous)
			)
			return this.createDestination(unescapedTarget, start)
		}
		return null
	}

	override canUpdate(original: MfMLinkDestination, update: ContentUpdate, replacedText: string): boolean {
		for(let c of update.text) {
			switch(c) {
				case '(': case ')': case '<': case '>': return false
			}
		}
		for(let c of replacedText) {
			switch(c) {
				case '(': case ')': case '<': case '>': case '\\': return false
			}
		}
		return super.canUpdate(original, update, replacedText)
	}

	findTarget(text: string, start: number, length: number, isValid: (current: string, previous: string) => boolean): [ string, number, ] {
		let i = 0
		let previousChar = ''
		let currentChar = text.charAt(start+i)
		const loop = finiteLoop(() => i, INCREASING)
		while(i <= length && isValid(currentChar, previousChar)) {
			loop.guard()

			i++
			previousChar = currentChar
			currentChar = text.charAt(start+i)
		}

		return [ text.substring(start, start+i), i, ]
	}

	createDestination(
		unescapedTarget: string, start: number,
		before?: (destination: MfMLinkDestination) => StringLineContent<MfMLinkDestination>,
		after?: (destination: MfMLinkDestination) => StringLineContent<MfMLinkDestination>
	) {
		const destination = new MfMLinkDestination(this.parsers.idGenerator.nextId(), this)
		destination.lines.push(new ParsedLine(this.parsers.idGenerator.nextLineId(), destination))
		const line = destination.lines[destination.lines.length-1]
		if(before) { line.content.push(before(destination)) }
		line.content.push(new StringLineContent(unescapedTarget, start, unescapedTarget.length, destination))
		if(after) { line.content.push(after(destination)) }

		return destination
	}
}
