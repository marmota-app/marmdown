import { ContentChange } from "./ContentChange"
import { MarkdownDocument } from "./MarkdownDocument"
import { ContentOptions } from "./MarkdownOptions"

export function parseMarkdown(markdown: string, changes: ContentChange[] = []): MarkdownDocument {
	return new MarkdownDocument()
}
