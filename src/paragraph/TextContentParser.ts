import { AdvancedConent, DefaultContent, TextContent } from "$markdown/MarkdownDocument"
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions"
import { OptionsParser } from "$markdown/options/OptionsParser"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { UpdatableElement } from "$markdown/UpdatableElement"

export class UpdatableTextContent extends UpdatableElement<UpdatableTextContent> implements TextContent, DefaultContent {
	readonly type = 'Text' as const

	constructor(private _content: string, _start: number, _length: number, parsedWith: TextContentParser) {
		super(_start, _length, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this._content }
	get asText() { return this._content }
}

export class TextContentParser extends LeafTextParser<UpdatableTextContent> implements TextParser<UpdatableTextContent> {
	parse(text: string, start: number, length: number): ParserResult<UpdatableTextContent> | null {
		return {
			startIndex: start,
			length: length,
			content: new UpdatableTextContent(text.substring(start, start + length), start, length, this),
		}
	}
}
