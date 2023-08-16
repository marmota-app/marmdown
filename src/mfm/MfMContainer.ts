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

import { Element, ParsedLine } from "../element/Element";
import { Container } from "../element/MarkdownElements";
import { MfMBlockElements } from "../MfMDialect";
import { EmptyElementParser } from "../parser/EmptyElementParser";
import { parseContainerBlock } from "../parser/parse";
import { MfMLinkReference } from "./block/MfMLinkReference";
import { MfMSection, MfMSectionParser } from "./block/MfMSection";
import { addOptionsToContainerBlock, MfMGenericBlock, MfMGenericContainerBlock } from "./MfMGenericElement";
import { MfMParser } from "./MfMParser";
import { MfMOptionsParser } from "./options/MfMOptions";

/**
 * Main container element for the "MfM" dialect. 
 */
export class MfMContainer extends MfMGenericContainerBlock<MfMContainer, MfMBlockElements, 'container', MfMContainerParser> implements Container<MfMContainer, MfMBlockElements> {
	#linkReferences: { [key: string]: MfMLinkReference } = {}

	protected self: MfMContainer = this

	constructor(id: string, pw: MfMContainerParser, private sectionParser: MfMSectionParser) { super(id, 'container', pw) }

	override addContent(content: MfMBlockElements): void {
		if(this.content.length === 0 && content.type !== 'section') {
			const section = this.sectionParser.create(1)
			section.addContent(content)
			super.addContent(section)
		} else {
			super.addContent(content)
		}
	}
	
	get linkReferences() { return this.#linkReferences }

	updateLinkReferences() {
		this.#linkReferences = {}

		this.#updateLinkReferences(this)
	}

	#updateLinkReferences(container: MfMGenericBlock<unknown, Element<unknown, unknown, unknown, unknown>, unknown, any>) {
		if(container.type === 'link-reference') {
			const ref = container as MfMLinkReference
			const id = ref.text?.normalized
			if(id != null && this.#linkReferences[id] == null) {
				this.#linkReferences[id] = ref
			}
		} else {
			container.content.forEach(c => {
				if((c as unknown as { classification: string }).classification === 'block') {
					this.#updateLinkReferences(c as any)
				}
			})
		}
	}
}

/**
 * Parse line content into `MfMContainer` (the main container type of the MfM dialect). 
 * 
 * A MfM document consists exclusively of {@link MfMSection} elements, and
 * this parser must make sure that it is like that. To achive this, it creates
 * a section as "previous content" to start with, which can be used when
 * the document does not start with a heading.
 */
export class MfMContainerParser extends MfMParser<MfMContainer, MfMContainer, MfMOptionsParser | MfMSectionParser | EmptyElementParser> {
	public readonly elementName = 'MfMContainer'

	create() {
		return new MfMContainer(this.parsers.idGenerator.nextId(), this, this.parsers['MfMSection'])
	}
	parseLine(previous: MfMContainer | null, text: string, start: number, length: number): MfMContainer | null {
		const container = previous ?? this.create()

		const optionsResult = addOptionsToContainerBlock(container, text, start, length, this.parsers)
		if(optionsResult.lineFullyParsed) {
			return container
		}

		let result = parseContainerBlock<MfMContainer, MfMBlockElements>(previous, container, text, start+optionsResult.parsedLength, length-optionsResult.parsedLength, this.allBlocks, this.parsers.idGenerator)

		return result
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }

	override parseLineUpdate(original: MfMContainer, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		//A container cannot be updated directly, only its contents can be updated.
		//When an update bubbles up to this point, it is better to re-parse the
		//whole document, so the container parser returns null here.
		return null
	}
}
