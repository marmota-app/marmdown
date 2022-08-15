import { ContentChange } from "./ContentChange";
import { MarkdownDocument } from "./MarkdownDocument";

export function parseMarkdown(markdown: string, changes: ContentChange[] = []): MarkdownDocument {
	return new MarkdownDocument()
}
