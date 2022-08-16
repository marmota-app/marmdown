import { ParserResult, TextParser } from "$markdown/parser/TextParser";

export class HeadingParser implements TextParser {
	parse(text: string, start: number, length: number): ParserResult | null {
		return null
	}
}