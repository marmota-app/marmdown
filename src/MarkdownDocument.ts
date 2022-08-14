import { ContentOptions } from "./MarkdownOptions";

export type Content = Empty |
	Heading |
	List |
	Table |
	Paragraph |
	Block |
	Preformatted |
	HorizontalRule


export type Empty = { type: 'Empty', }

const ALL_LEVELS = [ 1, 2, 3, 4, ] as const;
export type Level = (typeof ALL_LEVELS)[number];

export type Heading = {
	type: 'Heading',
	level: Level,
	text: string,
	options: ContentOptions,
}

export type Newline = { type: 'Newline', }
export type LineBreak = { type: 'LineBreak', }
export type TextContent = { type: 'Text', content: string, }
export type BoldTextContent = { type: 'Bold', content: ParagraphContent[], options: ContentOptions, }
export type ItalicTextContent = { type: 'Italic', content: ParagraphContent[], options: ContentOptions, }
export type StrikeThroughTextContent = { type: 'StrikeThrough', content: ParagraphContent[], options: ContentOptions, }
export type InlineCodeTextContent = {
	type: 'InlineCode',
	content: (TextContent | Arrow)[],
	options: ContentOptions,
}
export type InlineLink = {
	type: 'InlineLink',
	description: string,
	href: string,
	options: ContentOptions,
}
export type InlineImage = {
	type: 'InlineImage',
	description: string,
	href: string,
	options: ContentOptions,
}
export type Arrow = {
	type: 'Arrow',
	pointingTo: string,
	options: ContentOptions,
}

export type ParagraphContent =
	TextContent |
	BoldTextContent |
	ItalicTextContent |
	StrikeThroughTextContent |
	InlineCodeTextContent |
	InlineLink |
	InlineImage |
	Arrow |
	LineBreak |
	Newline

export type Paragraph = {
	type: 'Paragraph',
	content: ParagraphContent[],
	options?: ContentOptions,
}

export type List = {
	type: 'UnorderedList' | 'OrderedList',
	indentLevel: number,
	items: ListItem[],
	options: ContentOptions,
}

export type ListItem = {
	type: 'ListItem',
	readonly options: ContentOptions,
	content: (Content & DefaultContent)[],
}

export type Table = {
	type: 'Table',
	columns?: TableColumn[],
	headings: TableCell[],
	rows: TableRow[],
	options: ContentOptions,
}

export type TableColumn = {
	align: 'left' | 'center' | 'right'
}
export type TableCell = {
	type: 'TableCell',
	content: ParagraphContent[],
}
export type TableRow = {
	type: 'TableRow',
	columns: TableCell[],
}

export type Block = {
	type: 'Aside' | 'Blockquote',
	readonly options: ContentOptions,
	content: (Content & DefaultContent)[],
}

type PreformattedContent = TextContent | Newline | Arrow
export type Preformatted = {
	type: 'Preformatted',
	content: PreformattedContent[],
	options: ContentOptions,
}

export type HorizontalRule = {
	type: 'HorizontalRule',
	level: Level,
	options: ContentOptions,
}

export type DefaultContent = {
	hasChanged: boolean,
}
export class MarkdownDocument {
	readonly options: ContentOptions = {}
	readonly content: (Content & DefaultContent)[] = []
}

export interface ParseResult {
	readonly options: ContentOptions,
	content: (Content & DefaultContent)[],
}
