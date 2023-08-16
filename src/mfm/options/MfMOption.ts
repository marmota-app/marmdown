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

import { LeafInline, ParsedLine, StringLineContent } from "../../element/Element"
import { GenericLeafInline } from "../../element/GenericElement"
import { findTrimmed } from "../../parser/find"
import { InlineParser, Parser } from "../../parser/Parser"

export interface Option<P extends MfMGenericOptionParser<P>> extends LeafInline<MfMOption<P>, 'option'> {
}

export class MfMOption<P extends MfMGenericOptionParser<P>> extends GenericLeafInline<MfMOption<P>, never, StringLineContent<MfMOption<P>>, 'option', P> implements Option<P> {
	constructor(id: string, pw: P) { super(id, 'option', pw) }

	get key() { 
		if(this.lines.length !== 1) { throw new Error(`Cannot get option key: Option must have exactly one line, has ${this.lines.length}`) }

		const keyContent = this.lines[0].content.filter((c: any) => c.type==='option-key')[0]
		if(keyContent) {
			return keyContent.asText
		}

		return 'default' 
	}
	get value() {
		if(this.lines.length !== 1) { throw new Error(`Cannot get option value: Option must have exactly one line, has ${this.lines.length}`) }

		const valueContent = this.lines[0].content.filter((c: any) => c.type==='option-value')[0]
		if(valueContent) {
			return valueContent.asText
		}

		return ''
	}
}

export class MfMOptionValue extends StringLineContent<MfMOption<any>> {
	type = 'option-value'
}
export class MfMOptionKey extends StringLineContent<MfMOption<any>> {
	type = 'option-key'
}

abstract class MfMGenericOptionParser<P extends MfMGenericOptionParser<P>> extends InlineParser<MfMOption<P>> {
	public abstract readonly elementName: string
	abstract readonly allowDefault: boolean

	parseInline(text: string, start: number, length: number): MfMOption<P> | null {
		const option = new MfMOption<P>(this.parsers.idGenerator.nextId(), this as unknown as P)
		
		const optionLine = new ParsedLine<MfMOptionKey | MfMOptionValue | StringLineContent<MfMOption<P>>, MfMOption<P>>(this.parsers.idGenerator.nextLineId(), option)
		
		const openingBracketIndex = text.indexOf('{', start)
		if(openingBracketIndex >= start && openingBracketIndex < start+length) {
			return null
		}
		const closingBracketIndex = text.indexOf('}', start)
		if(closingBracketIndex >= start && closingBracketIndex < start+length) {
			return null
		}
		
		findTrimmed(text, [ ';', ], start, length).insertInto(optionLine, option, (found, foundStart, foundLength) => {
			if(found.indexOf('=') >= 0) {
				const foundKey = findTrimmed(found, [ '=', ], 0, found.length).insertInto(optionLine, option, (key, keyStart, keyLength) => {
					return new MfMOptionKey(key, foundStart+keyStart, keyLength, option)
				})
				const valueStart = foundKey.start+foundKey.length
				findTrimmed(found, [ ], valueStart, found.length-valueStart).insertInto(optionLine, option, (val, valStart, valLength) => {
					return new MfMOptionValue(val, foundStart+valStart, valLength, option)
				})
			} else if(this.allowDefault) {
				return new MfMOptionValue(found, foundStart, foundLength, option)
			}

			return null
		})

		option.lines.push(optionLine)

		if(option.key === 'default' && !this.allowDefault) { return null }
		return option
	}
}

export class MfMFirstOptionParser extends MfMGenericOptionParser<MfMFirstOptionParser> {
	public readonly elementName = 'MfMFirstOption'
	readonly allowDefault = true
}
export class MfMOptionParser extends MfMGenericOptionParser<MfMOptionParser> {
	public readonly elementName = 'MfMOption'
	readonly allowDefault = false
}
