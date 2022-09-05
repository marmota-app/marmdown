import { AdvancedConent, DefaultContent, Newline } from "$markdown/MarkdownDocument"
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions"
import { OptionsParser } from "$markdown/options/OptionsParser"
import { find, findOne } from "$markdown/parser/find"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { UpdatableElement } from "$markdown/UpdatableElement"

export class UpdatableNewlineContent extends UpdatableElement<UpdatableNewlineContent> implements Newline, DefaultContent {
	readonly type = 'Newline' as const

	constructor(private _content: string, _start: number, _length: number, parsedWith: NewlineContentParser) {
		super(_start, _length, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this._content }
	get asText() { return this._content }
}

export class NewlineContentParser extends LeafTextParser<UpdatableNewlineContent> implements TextParser<UpdatableNewlineContent> {
	parse(text: string, start: number, length: number): ParserResult<UpdatableNewlineContent> | null {
		let i = 0
		const incrementIndex = (l: number) => i+=l

		const newLine = findOne(text, ['\r\n', '\r', '\n'], start+i, length-i, incrementIndex)
		if(newLine) {
			return {
				startIndex: start,
				length: i,
				content: new UpdatableNewlineContent(newLine.completeText, start, i, this),
			}
		}

		return null
	}
}
