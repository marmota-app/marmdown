import { Element, LeafBlock, LineContent, ParsedLine, StringLineContent } from "$element/Element";
import { GenericBlock } from "$element/GenericElement";
import { isEmpty } from "$parser/find";
import { Parser } from "$parser/Parser";
import { MfMFirstOptionParser, MfMOption, MfMOptionParser } from "./MfMOption";

export interface Options extends LeafBlock<MfMOptions, MfMOption<MfMFirstOptionParser | MfMOptionParser>, 'options'> {
}

export class MfMOptions extends GenericBlock<MfMOptions, MfMOption<MfMFirstOptionParser | MfMOptionParser>, 'options', MfMOptionsParser> implements Options {
	private _isFullyParsed = false

	constructor(id: string, pw: MfMOptionsParser) { super(id, 'options', pw) }

	get isFullyParsed(): boolean { return this._isFullyParsed }
	set isFullyParsed(fp: boolean) { this._isFullyParsed =fp }
}

export class MfMOptionsParser extends Parser<MfMOptions> {
	public readonly elementName = 'MfMOptions';

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

		if(!isLastLine) {
			return !update.belongsTo.isFullyParsed
		}
		
		return true
	}

	private parseOptionsLine(options: MfMOptions, text: string, start: number, length: number, firstParser: MfMFirstOptionParser | MfMOptionParser, firstContent: StringLineContent<MfMOptions> | null) {
		const closingBracketIndex = this.findClosingBracket(text, start, length)
		const parseLength = closingBracketIndex >= 0? (closingBracketIndex-start) : length

		const line: ParsedLine<StringLineContent<MfMOptions>, MfMOptions> = new ParsedLine(options)
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