import { TextParser } from "./parser/TextParser";

/**
 * Represents the whole document, a single line of the whole document or a part of a single line. 
 * 
 * `ParsedDocumentContent` contains all the informaion the parser needs to
 * partially update parsed documents ([/docs/the-logical-document-structure.md](/docs/the-logical-document-structure.md))
 * and to recreate the original content from the data structure (using `asText`).
 * 
 * `contained` is an array of all the contents inside the current document content.
 * It must completely represent the current conentent, i.e. the following must be
 * true:
 * 
 * ```
 * asText === contained.map(c => c.asText).join('')
 * ```
 */
export class ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS> {
	constructor(public start: number, public belongsTo?: Updatable<UPDATABLE_TYPE, CONTENTS, ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>>, public contained: ParsedDocumentContent<unknown, unknown>[] = []) {}
	get asText(): string {
		return this.contained.map(c => c.asText).join('')
	}

	public parent?: ParsedDocumentContent<unknown, unknown>

	get length(): number {
		return this.contained
			.map(c => c.length)
			.reduce((r, l)=>r+l, 0)
	}
}
export interface Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>> {
	contents: DOCUMENT_CONTENT[],
	parsedWith?: TextParser<CONTENTS, Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT>, DOCUMENT_CONTENT>,
}

export type ToUpdatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>> = 
	UPDATABLE_TYPE extends any? Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT> & UPDATABLE_TYPE : never

export class StringContent<UPDATABLE_TYPE> extends ParsedDocumentContent<UPDATABLE_TYPE, unknown> {
	constructor(public text: string, start: number, belongsTo?: Updatable<UPDATABLE_TYPE, unknown, ParsedDocumentContent<UPDATABLE_TYPE, unknown>>) {
		super(start, belongsTo)
	}
	get asText(): string {
		return this.text
	}
	override get length() { return this.text.length }
}
