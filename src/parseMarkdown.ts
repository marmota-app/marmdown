import { ContentChange } from "./ContentChange";
import { MarkdownDocument } from "./MarkdownDocument";
import { Marmdown } from "./Marmdown";

export function parseMarkdown(markdown: string, changes: ContentChange[] = []): MarkdownDocument {
	return new Marmdown(markdown).document
}
