/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { jsonTransient } from "../jsonTransient";
import { Parser } from "../parser/Parser"

/**
 * A marmdown document consists of `Element`s, and they can either be blocks
 * or inlines. 
 * 
 * Consider the following text content:
 * 
 * ```
 * - Sphinx of black **quartz,**
 *   judge my vow.
 * ```
 * 
 * The structure when parsing that content is (where every node in the
 * structure is an element):
 * 
 * ```
 * unordered list [meta container]
 * \--- list item [container block]
 *      \--- paragraph [leaf block]
 *           +--- text content [leaf inline]
 *           +--- bold content [container inline]
 *           |    \--- text content [leaf inline]
 *           \--- text content [leaf inline]
 * ```
 * 
 * But the data structure also has to take into account the line structure
 * of the document, resulting in a structure like:
 * 
 * ```
 * unordered list <=================================> unordered list, line content 1                                       [#]
 * ^   \--- list item <=============================> list item, line content 1                               ['- ', #] <---/
 * |        ^   \--- paragraph <====================> paragraph, line content 1                           [#, #] <---/
 * |        |        ^   +--- text content <========> text content, line content ['Sphinx of black '] <----/  |
 * |        |        |   +--- bold content <========> bold content, line content          ['**', #, '**'] <---/
 * |        |        |   |    \--- text content <===> text content, line content ['quartz,'] <-----/
 * |        |        |   \--- text content <========> text content, line content ['judge my vow.'] <---\
 * |        |        \==============================> paragraph, line content 2                           [#] <---\
 * |        \=======================================> list item, line content 2                           ['  ', #] <---\
 * \================================================> unordered list, line content 2                                    [#]
 * ```
 * 
 * This looks complicated at first. It shows that
 * - every _Element_ (meta container, container block, leaf block, container
 *   inline or leaf inline) knows it's _contents_ (Which are _Element_s&mdash;e.g.
 *   unordered list knows list item)
 * - every _Element_ knows one or more _Line_s
 * - the lines know the element they _belong to_
 * - the lines hold the actual text conten of the document, but they refer to
 *   line content further down the tree for inner content
 * 
 * **Note:** Elements do not have an `asText` property because the text of
 * a document cannot be reproduces from the texts of its elements. That is
 * only possible by the texts of its lines, e.g. in case of nested block
 * contents (blockquote and paragraph, list and blockquote, etc.).
 * 
 * @category $element
 */
export interface Element<
	THIS extends Element<THIS, CONTENT, LINE_CONTENT, TYPE> | unknown, 
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE_CONTENT extends LineContent<THIS> | unknown,
	TYPE extends string | unknown,
> {
	/**
	 * Unique identifier for this instance of the element. 
	 * 
	 * The ID is created when the element is created. When parsing an _update_
	 * keeps the element intact and changes only its content, the ID must stay 
	 * the same. When parsing an update changes the document structure at
	 * this point, the element is discarded and a new Element with a new,
	 * unique ID is created.
	 * 
	 * This feature allows users of the element tree to determine which
	 * elements were changed by an update.
	 * 
	 * IDs **must** be unique **within a markdown document**.
	 */
	id: string,

	/**
	 * The type of the element, used to distinguish different kinds of
	 * element (headlines, paragraphs, etc.). 
	 */
	readonly type: TYPE,

	/** The inner elements that make up the content of this element. */
	content: CONTENT[],
	/** The lines that, together, created the content of this element. 
	 * 
	 * TODO do we need an abstraction for a single line? As in, differentiate
	 *      between **line** and **line content**? Currently, the code does
	 *      not really do that, and this might lead to confusing situations.
	 *      OTOH, an abstraction might be just another way for writing down
	 *      an array, which might be confusing too...
	 */
	lines: ParsedLine<LINE_CONTENT, THIS>[],

	/** The {@link Parser} this element was parsed with. */
	parsedWith: Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
	/** 
	 * Describes whether the element is fully parsed and thus cannot be extended
	 * by a next line anymore, or whether the parser can still try to add
	 * the next line to this element. 
	 */
	readonly isFullyParsed: boolean,

	childrenChanged: (() => unknown) | undefined,
}

/**
 * Stores the content of the original document in a data structure based on lines,
 * and the `Element`s must get their current content from this data structure. 
 * 
 * The data structure formed by `LineContent` contains the original document
 * that was initially parsed _or_ the current state of the original document
 * in case there were _updates_.
 * 
 * `Element`s must rely on the `LineContent` data structure to receive their
 * data; otherwise the data will be wrong after parsing updates.
 * 
 * @category $element
 */
export interface LineContent<BELONGS_TO extends Element<unknown, unknown, unknown, unknown> | unknown> {
	readonly lineType: 'direct' | 'dynamic',

	belongsTo: BELONGS_TO,

	/**
	 * The current start value of the line content's text in the **current** document
	 * (even after parsing updates), not necessarily an index in the original
	 * text.
	 */
	start: number,
	/**
	 * The current length of the line content's text (even after parsing updates).
	 */
	readonly length: number,

	/**
	 * The content of the line, rendered as text that can be parsed again by
	 * a Marmdown parser. 
	 */
	readonly asText: string,

	/**
	 * The content of the line, rendered as text that is safe to be parsed
	 * by an HTML parser. 
	 */
	readonly asSafeText: string,
}

export type LineId = `line-${string}`

/**
 * A single parsed line that is part of an {@link Element}. 
 */
export class ParsedLine<
	LINE_CONTENT extends LineContent<Element<unknown, unknown, unknown, unknown>> | unknown,
	BELONGS_TO extends Element<unknown, unknown, unknown, unknown> | unknown,
> implements LineContent<BELONGS_TO> {
	readonly lineType: 'direct' | 'dynamic' = 'direct'
	#content: LINE_CONTENT[] = []
	/** For an updated line, unique id of the original line content, before the update. */
	public originalId: string | undefined;

	public get content(): LINE_CONTENT[] { return this.#content }

	constructor(public readonly id: LineId, public belongsTo: BELONGS_TO) {
		jsonTransient(this, 'belongsTo')
	}

	get start() { return (this.content[0] as LineContent<BELONGS_TO>).start ?? 0 }
	get length() {
		if(this.content.length > 0) {
			const last = this.content[this.content.length-1] as LineContent<BELONGS_TO>
			const first = this.content[0] as LineContent<BELONGS_TO>

			return last.start + last.length - first.start
		}
		return 0
	}

	get asText() { 
		return this.content.map(c => (c as LineContent<BELONGS_TO>).asText).join('')
	}
	get asSafeText() {
		return this.content.map(c => (c as LineContent<BELONGS_TO>).asSafeText).join('')
	}
}

/**
 * Text content in a `LineContent` data structure (See {@link LineContent}). 
 * 
 * @category $element
 */
export class StringLineContent<BELONGS_TO extends Element<unknown, unknown, unknown, unknown> | unknown> implements LineContent<BELONGS_TO> {
	readonly lineType='direct'
	constructor(private text: string, public readonly start: number, public readonly length: number, public readonly belongsTo: BELONGS_TO) {}

	public get asText() {
		return this.text
	}
	public get asSafeText() {
		return this.text
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
	}
}

export interface Block<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
> extends Element<THIS, CONTENT, LineContent<Element<unknown, unknown, unknown, unknown>>, TYPE> {
}
export interface ContainerBlock<
	THIS extends ContainerBlock<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Block<unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
> extends Block<THIS, CONTENT, TYPE> {}
export interface LeafBlock<
	THIS extends LeafBlock<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
	TYPE extends string,
> extends Block<THIS, CONTENT, TYPE> {}

export interface Inline<
	THIS extends Inline<THIS, CONTENT, LINE, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE extends LineContent<THIS>,
	TYPE extends string | unknown,
> extends Element<THIS, CONTENT, LineContent<Element<unknown, unknown, unknown, unknown>>, TYPE> {
}
export interface ContainerInline<
	THIS extends ContainerInline<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
	TYPE extends string,
> extends Inline<THIS, CONTENT, LineContent<THIS>, TYPE> {}
export interface LeafInline<THIS extends LeafInline<THIS, TYPE> | unknown, TYPE extends string>
	extends Inline<THIS, never, StringLineContent<THIS>, TYPE> {}
