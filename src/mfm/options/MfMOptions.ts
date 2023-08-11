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

import { Element, LeafBlock, LineContent, ParsedLine, StringLineContent } from "$element/Element";
import { GenericBlock } from "$element/GenericElement";
import { OptionsPostprocessor } from "$markdown/MfMDialect";
import { MfMParsers } from "$mfm/MfMParsers";
import { isEmpty } from "$parser/find";
import { Parser } from "$parser/Parser";
import { MfMFirstOptionParser, MfMOption, MfMOptionParser } from "./MfMOption";

class EmptyOptionsParser extends Parser<MfMOptions> {
	public readonly elementName = 'MfMEmptyOption'

	parseLine(previous: MfMOptions | null, text: string, start: number, length: number): MfMOptions | null {
		throw new Error('Cannot parse empty options: This is just a dummy parser to make sure we can create an empty options object.')
	}
}
export const EMPTY_OPTIONS_PARSER = new EmptyOptionsParser({ idGenerator: { nextId: () => '__empty__', nextLineId: () => '__empty_line__',}})

export interface Options extends LeafBlock<MfMOptions, MfMOption<MfMFirstOptionParser | MfMOptionParser>, 'options'> {
	keys: string[]
	get(key: string): string | null | undefined
}

export class MfMOptions extends GenericBlock<MfMOptions, MfMOption<MfMFirstOptionParser | MfMOptionParser>, 'options', Parser<MfMOptions>> implements Options {
	readonly classification = 'options'
	public readonly additionalOptions: { [key: string]: string } = {}

	private _isFullyParsed: boolean

	constructor(id: string, pw: Parser<MfMOptions>, _isFullyParsed: boolean = false) {
		super(id, 'options', pw)
		this._isFullyParsed = _isFullyParsed
	}

	get isFullyParsed(): boolean { return this._isFullyParsed }
	set isFullyParsed(fp: boolean) { this._isFullyParsed = fp }
	
	get isEmpty(): boolean { return this.content.length === 0 }

	get(key: string) { return this.content.find(c => c.key===key)?.value ?? this.additionalOptions[key] }

	get keys(): string[] {
		return [ ...this.content.map(c => c.key), ...Object.keys(this.additionalOptions) ]
	}
}

export class MfMOptionsParser extends Parser<MfMOptions, MfMOptions, MfMFirstOptionParser | MfMOptionParser> {
	public readonly elementName = 'MfMOptions';

	addOptionsTo(
		element: { options: MfMOptions, lines: ParsedLine<any, any>[],}, 
		text: string, start: number, length: number,
		addLine = (line: ParsedLine<StringLineContent<MfMOptions>, MfMOptions>, parsedLength: number) => {
			element.lines[element.lines.length-1].content.push(line)
			return parsedLength
		}
	): { parsedLength: number} {
		let i=0
		let lastOptionLine: ParsedLine<StringLineContent<MfMOptions>, MfMOptions> | undefined = undefined

		const previousOptions = element.options

		const dialectOptions = (this.parsers as MfMParsers).dialectOptions
		if(previousOptions.id==='__empty__' && !previousOptions.isFullyParsed && text.charAt(start+i) === '{') {
			const options = this.parseLine(null, text, start+i, length-i)
			if(options != null) {
				this.#postprocess(element, options, dialectOptions?.optionsPostprocessors)
				lastOptionLine = options.lines[options.lines.length-1] as ParsedLine<StringLineContent<MfMOptions>, MfMOptions>
				i += lastOptionLine.length
			}
		} else if(!previousOptions.isEmpty && !previousOptions.isFullyParsed) {
			const options = this.parseLine(previousOptions as MfMOptions, text, start+i, length-i)
			if(options != null) {
				this.#postprocess(element, options, dialectOptions?.optionsPostprocessors)
				lastOptionLine = options.lines[options.lines.length-1] as ParsedLine<StringLineContent<MfMOptions>, MfMOptions>
				i += lastOptionLine.length
			}
		} else if(previousOptions.id==='__empty__') {
			this.#postprocess(element, previousOptions, dialectOptions?.optionsPostprocessors)
			previousOptions.isFullyParsed = true
		}

		if(lastOptionLine) {
			i = addLine(lastOptionLine, i)
		}

		return { parsedLength: i }
	}

	#postprocess(element: any, options: MfMOptions, postprocessors?: { [key: string]: OptionsPostprocessor<any>[] }) {
		if(postprocessors && postprocessors[element.type]) {
			postprocessors[element.type].forEach(p => p(element, options, (key: string, value: string) => { options.additionalOptions[key]=value} ))
		}
	}

	override parseLine(previous: MfMOptions | null, text: string, start: number, length: number): MfMOptions | null {
		const options = previous ?? new MfMOptions(this.parsers.idGenerator.nextId(), this)
		
		if(previous && !previous.isFullyParsed && text.charAt(start) !== '{') {
			return this.parseOptionsLine(options, text, start, length, this.parsers.MfMOption, null)
		}
		if(!previous && text.charAt(start) === '{') {
			return this.parseOptionsLine(options, text, start+1, length-1, this.parsers.MfMFirstOption, new StringLineContent('{', start, 1, options))
		}

		return null
	}

	override parseLineUpdate(original: MfMOptions, text: string, start: number, length: number, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>): ParsedLine<unknown, unknown> | null {
		const container = new MfMOptions(this.parsers.idGenerator.nextId(), this)
		const isFirstLine = originalLine === original.lines[0]

		let result: MfMOptions | null = null
		if(isFirstLine && text.charAt(start) === '{') {
			result = this.parseOptionsLine(container, text, start+1, length-1, this.parsers.MfMFirstOption, new StringLineContent('{', start, 1, container))
		}
		if(!isFirstLine && text.charAt(start) !== '{') {
			result = this.parseOptionsLine(container, text, start, length, this.parsers.MfMOption, null)
		}
		if(result) {
			return result.lines[0]
		}
		return null
	}

	override isFullyParsedUpdate(update: LineContent<Element<unknown, unknown, unknown, unknown>>, originalLine: LineContent<Element<unknown, unknown, unknown, unknown>>): boolean {
		const isLastLine = originalLine === originalLine.belongsTo.lines[originalLine.belongsTo.lines.length-1]

		if(isLastLine) {
			return update.asText.endsWith('}')
		} else {
			return !update.belongsTo.isFullyParsed
		}
	}

	private parseOptionsLine(options: MfMOptions, text: string, start: number, length: number, firstParser: MfMFirstOptionParser | MfMOptionParser, firstContent: StringLineContent<MfMOptions> | null) {
		const closingBracketIndex = this.findClosingBracket(text, start, length)
		const parseLength = closingBracketIndex >= 0? (closingBracketIndex-start) : length

		const line: ParsedLine<StringLineContent<MfMOptions>, MfMOptions> = new ParsedLine(this.parsers.idGenerator.nextLineId(), options)
		if(firstContent) { line.content.push(firstContent) }
		options.lines.push(line)

		let i=0
		let nextParser = firstParser
		while(i < parseLength) {
			const option = nextParser.parseLine(null, text, start+i, parseLength-i)
			if(option) {
				options.addContent(option)
				i += option.lines[0].length
			} else {
				break
			}
			nextParser = this.parsers.MfMOption
		}

		if(closingBracketIndex >= 0 && isEmpty(text, start+i, closingBracketIndex-i-start)) {
			const trailing = text.substring(start+i, closingBracketIndex+1)
			line.content.push(new StringLineContent(trailing, start+i, trailing.length, options))
			options.isFullyParsed = true
		}

		if(options.lines[options.lines.length-1].length === 0) {
			options.lines.pop()
			return null
		}
		return options
	}

	private findClosingBracket(text: string, start: number, length: number) {
		const closingBracketIndex = text.indexOf('}', start)

		if(closingBracketIndex < start+length) {
			return closingBracketIndex
		}

		return -1
	}
}
