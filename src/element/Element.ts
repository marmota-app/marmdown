/*
   Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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

/**
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
 */
export interface Element<THIS extends Element<THIS, CONTENT>, CONTENT extends Element<any, unknown> | never | unknown> {
	id: string,
	content: CONTENT[],
	lines: LineContent<THIS>[],
}
export interface LineContent<BELONGS_TO extends Element<any, unknown> | unknown> {
	belongsTo: BELONGS_TO,
	content: LineContent<Element<any, unknown>>[]
	asText: string,
}

export class StringLineContent<BELONGS_TO extends Element<any, unknown>> implements LineContent<BELONGS_TO> {
	content: never[] = []
	constructor(public asText: string, public belongsTo: BELONGS_TO) {}
}
export class GenericLineContent<BELONGS_TO extends Element<any, unknown>> implements LineContent<BELONGS_TO> {
	content: LineContent<Element<any, unknown>>[] = []
	constructor(public belongsTo: BELONGS_TO) {}

	get asText() {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}

export abstract class Block<
	THIS extends Block<THIS, CONTENT, TYPE>,
	CONTENT extends Element<any, unknown> | unknown,
	TYPE = string,
> implements Element<THIS, CONTENT> {
	public readonly content: CONTENT[] = []
	public readonly lines: LineContent<THIS>[] = []

	constructor(public readonly id: string, public readonly type: TYPE) {}
}
export class ContainerBlock extends Block<ContainerBlock, Block<any, unknown>> {}
export class LeafBlock extends Block<LeafBlock, Inline<any, unknown, LineContent<unknown>> {}

export abstract class Inline<
	THIS extends Inline<THIS, CONTENT, LINE>,
	CONTENT extends Element<any, unknown> | never | unknown,
	LINE extends LineContent<THIS>,
> implements Element<THIS, CONTENT> {
	public readonly content: CONTENT[] = []
	public readonly lines: LINE[] = []

	constructor(public id: string) {}
}
export class ContainerInline extends Inline<ContainerInline, Inline<any, unknown, LineContent<unknown>>, LineContent<ContainerInline>> {}
export class LeafInline extends Inline<LeafInline, never, StringLineContent<LeafInline>> {}
