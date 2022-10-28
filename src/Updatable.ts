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
export interface ParsedDocumentContent<T, C> { 
	start: number,
	length: number,
	asText: string,

	contained: ParsedDocumentContent<unknown, unknown>[],
	parent?: ParsedDocumentContent<unknown, unknown>,
	belongsTo?: Updatable<T, C>,
}
export interface Updatable<T, C> {
	contents: ParsedDocumentContent<T, C>[],
	parsedWith?: TextParser<C, Updatable<T, C>>,
}

export type ToUpdatable<T, C> = T extends any? Updatable<T, C> & T : never
