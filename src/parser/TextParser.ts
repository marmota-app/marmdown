import { Content, DefaultContent } from "$markdown/MarkdownDocument";

export interface ParserResult<T = (Content & DefaultContent)> {
	startIndex: number,
	length: number,
	content: T,
}

export interface TextParser<T = (Content & DefaultContent)> {
	parse(text: string, start: number, length: number): ParserResult<T> | null,
}
