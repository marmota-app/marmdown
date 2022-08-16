import { Content, DefaultContent } from "$markdown/MarkdownDocument";

export interface ParserResult<T> {
	startIndex: number,
	length: number,
	content: T,
}

export interface TextParser<T = (Content & DefaultContent)> {
	parse(text: string, start: number, length: number): ParserResult<T> | null,
}
