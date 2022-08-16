import { ContentOptions } from "$markdown/MarkdownOptions";
import { ParserResult, TextParser } from "../parser/TextParser";

export class OptionsParser implements TextParser<ContentOptions> {
	parse(text: string, start: number, length: number): ParserResult<ContentOptions> | null {
		return null
	}
}