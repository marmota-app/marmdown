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

import { Block, Element, Inline, LineContent, ParsedLine, StringLineContent } from "../element/Element"
import { GenericBlock, GenericContainerInline, GenericLeafInline } from "../element/GenericElement"
import { Parser } from "../parser/Parser"
import { Parsers } from "../parser/Parsers"
import { EMPTY_OPTIONS_PARSER, MfMOptions, MfMOptionsParser } from "./options/MfMOptions"

/**
 * Abstract base class for MfM block elements. 
 */
export abstract class MfMGenericBlock<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends GenericBlock<THIS, CONTENT, TYPE, PARSER> {
	readonly classification: 'block' | 'options' = 'block'
	private emptyOptions = new MfMOptions('__empty__', EMPTY_OPTIONS_PARSER, false)

	continueWithNextLine: boolean = true
	override get isFullyParsed(): boolean {
		//The element can only ever be fully parsed when the options are
		//already fully parsed!
		return this.options.isFullyParsed? !this.continueWithNextLine : false
	}
	get options(): MfMOptions {
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? this.emptyOptions
	}
}

/**
 * Abstract base class for MfM inline elements.
 */
export abstract class MfMGenericContainerInline<
	THIS extends Inline<THIS, CONTENT, LINE_CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE_CONTENT extends LineContent<THIS>,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends GenericContainerInline<THIS, CONTENT, LINE_CONTENT, TYPE, PARSER> {
	readonly classification = 'inline'

	private emptyOptions = new MfMOptions('__empty__', EMPTY_OPTIONS_PARSER, false)
	get options(): MfMOptions {
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? this.emptyOptions
	}
}

export abstract class MfMGenericLeafInline<
	THIS extends Inline<THIS, CONTENT, LINE_CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | never | unknown,
	LINE_CONTENT extends LineContent<THIS>,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends GenericLeafInline<THIS, CONTENT, LINE_CONTENT, TYPE, PARSER> {
	readonly classification = 'inline'

	private emptyOptions = new MfMOptions('__empty__', EMPTY_OPTIONS_PARSER, false)
	get options(): MfMOptions {
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? this.emptyOptions
	}
}

/**
 * Abstract base class for MfM elements that don't manage their line content directly. 
 * 
 * Elements that extend this base class handle content and content lines
 * differently than other elements: All line content of those elements is
 * derived directly from their content. So, they do not manipulate the line
 * content directly, they only add content. The line content is then always
 * created dynamically from the content.
 */
export abstract class MfMGenericContainerBlock<
	THIS extends Block<THIS, CONTENT, TYPE>,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends MfMGenericBlock<THIS, CONTENT, TYPE, PARSER> {
	protected abstract readonly self: THIS
	#content: CONTENT[] = []
	#attachments: { [lineId: string]: { [key: string]: any }} = {}
	#options = new MfMOptions('__empty__', EMPTY_OPTIONS_PARSER, false)

	constructor(
		id: string, readonly type: TYPE, readonly parsedWith: PARSER,
	) { super(id, type, parsedWith) }

	public override get content(): CONTENT[] {
		return this.#content
	}

	public override get options(): MfMOptions {
		return this.#options
	}
	public set options(o: MfMOptions) {
		this.#options = o
	}

	override get lines() {
		const dynamicLines: ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, THIS>[] = []

		this.options.lines.forEach((l, i) => {
			if(i < this.options.lines.length-1) {
				const line = l as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, Element<unknown, unknown, unknown, unknown>>
				dynamicLines.push(new DynamicLine<THIS>(
					line.id, [ line ],
					this.self, this.#attachments[l.id]?.['prepend'], this.#attachments[l.id]?.['append']))
			}
		})

		let contentStart = 0
		if(this.options.lines.length > 0) {
			const lastOptionsLine = this.options.lines[this.options.lines.length-1]
			//FIXME get rid of the casts!
			//FIXME is there always some content? Probably some --empty-- after the options? What if not?
			const middleLineContent: LineContent<Element<unknown, unknown, unknown, unknown>>[] = []

			middleLineContent.push(lastOptionsLine)
			const toAppend = this.#attachments[lastOptionsLine.id]?.['append']
			if(toAppend) { middleLineContent.push(toAppend) }

			if(!this.#attachments[lastOptionsLine.id]?.['lineFullyParsed']) {
				const firstContentLine = (this.content[0] as Element<unknown, unknown, unknown, unknown>).lines[0] as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, Element<unknown, unknown, unknown, unknown>>
				middleLineContent.push(firstContentLine)
				contentStart = 1
			}

			const middleLine = new DynamicLine<THIS>(
				lastOptionsLine.id,
				middleLineContent,
				this.self, this.#attachments[lastOptionsLine?.id ?? '']?.['prepend'], null
			)
			dynamicLines.push(middleLine)
		}

		this.#content.forEach((c, ci) => {
			(c as Element<unknown, unknown, unknown, unknown>).lines.forEach((l, li) => {
				if(ci > 0 || li >= contentStart) {
					const line = l as ParsedLine<LineContent<Element<unknown, unknown, unknown, unknown>>, Element<unknown, unknown, unknown, unknown>>
					dynamicLines.push(new DynamicLine<THIS>(
						line.id, [ line ],
						this.self, this.#attachments[l.id]?.['prepend'], this.#attachments[l.id]?.['append']))
				}
			})
		})

		dynamicLines.push = () => {
			throw new Error('Do not push to dynamically created lines of a container block!')
		}
		return dynamicLines
	}

	override addContent(content: CONTENT): void {
		this.#content.push(content)
	}

	get lastLine() {
		const lastContent = this.#content[this.content.length-1] as Element<unknown, unknown, unknown, unknown>
		const lastLine = lastContent.lines[lastContent.lines.length-1]
		return lastLine
	}

	attach(lineId: string, attachments: { [key: string]: any }) {
		const previousAttachments = this.#attachments[lineId] ?? {}
		this.#attachments[lineId] = { ...previousAttachments, ...attachments }
	}

	reattach(previousLineId: string | undefined, newLineId: string) {
		if(previousLineId) {
			this.#attachments[newLineId] = this.#attachments[previousLineId]
		}
	}
}

/**
 * Adds options to a generic container block and handles prepending text accordingly. 
 * 
 * @param block The block where the options should be added to. 
 * @param text The original text of the document. 
 * @param start The start of the potential options line. 
 * @param length The length of the potential options line. 
 * @param parsers A `Parsers` object that contains at least the MfM options parser. 
 * @param onLineAdded A callback that will be called when an options line was added to the block. 
 * @returns Meta information of the added line (whether it was fully parsed and the parsed length).
 */
export function addOptionsToContainerBlock(
	block: MfMGenericContainerBlock<any, unknown, unknown, Parser<any, Element<unknown, unknown, unknown, unknown>>>,
	text: string, start: number, length: number, parsers: Parsers<MfMOptionsParser>,
	onLineAdded?: (line: ParsedLine<StringLineContent<MfMOptions>, MfMOptions>, parsedLength: number) => unknown
): { lineFullyParsed: boolean, parsedLength: number } {
	let optionsParsed = false
	const addOptionsLine = (line: ParsedLine<StringLineContent<MfMOptions>, MfMOptions>, parsedLength: number) => {
		block.options = line.belongsTo
		const nextChar = text.charAt(start+parsedLength)
		if(nextChar === ' ' || nextChar === '\t') {
			block.attach(line.id, { append: new StringLineContent(nextChar, start+parsedLength, 1, block) })
			parsedLength++
		}
		if(parsedLength === length) { block.attach(line.id, { lineFullyParsed: true, }) }
		optionsParsed = true
		onLineAdded?.(line, parsedLength)

		return parsedLength
	}
	const parsedLength = parsers.MfMOptions.addOptionsTo(block, text, start, length, addOptionsLine).parsedLength

	return {
		lineFullyParsed: (optionsParsed && parsedLength === length),
		parsedLength,
	}
}

/**
 * A line that is dynamically created from another line, usually from the content of the inner element. 
 * 
 * In order to support [dynamically created line content]{@tutorial container-blocks-line-content},
 * container blocks must be able to derive their line content from their
 * children's line content. For each line of a child, the container then
 * creates an object of this class dynamically.
 */
export class DynamicLine<THIS extends Element<unknown, unknown, unknown, unknown>> extends ParsedLine<
	LineContent<Element<unknown, unknown, unknown, unknown>>,
	THIS
> {
	#content: LineContent<Element<unknown, unknown, unknown, unknown>>[] = []

	constructor(
		id: string,
		originalLines: LineContent<Element<unknown, unknown, unknown, unknown>>[], 
		belongsTo: THIS,
		prefix: LineContent<THIS> | null, suffix: LineContent<THIS> | null,
	) {
		super(id, belongsTo)

		if(prefix != null) { this.#content.push(prefix) }
		originalLines.forEach(originalLine => this.#content.push(originalLine))
		if(suffix != null) { this.#content.push(suffix) }
	}

	override get content() { return this.#content }
}
