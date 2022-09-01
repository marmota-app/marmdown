import { ContentChange } from "$markdown/ContentChange";
import { AdvancedConent, Content, DefaultContent } from "$markdown/MarkdownDocument";

export interface ParserResult<T = (Content & DefaultContent)> {
	startIndex: number,
	length: number,
	content: T,
}

export interface TextParser<T = (Content & DefaultContent & AdvancedConent)> {
	parse(text: string, start: number, length: number): ParserResult<T> | null,
	parsePartial(existing: T, change: ContentChange): ParserResult<T> | null,
}
