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

import { ParsedLine, StringLineContent } from "$element/Element";
import { Container } from "$element/MarkdownElements";
import { MfMBlockElements } from "$markdown/MfMDialect";
import { isEmpty } from "$parser/find";
import { parseBlock } from "$parser/parse";
import { MfMSection, MfMSectionParser } from "./block/MfMSection";
import { MfMGenericBlock } from "./MfMGenericElement";
import { MfMParser } from "./MfMParser";
import { MfMOptionsParser } from "./options/MfMOptions";

/**
 * Main container element for the "MfM" dialect. 
 */
export class MfMContainer extends MfMGenericBlock<MfMContainer, MfMBlockElements, 'container', MfMContainerParser> implements Container<MfMContainer, MfMBlockElements> {
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
}

/**
 * Parse line content into `MfMContainer` (the main container type of the MfM dialect). 
 * 
 * A MfM document consists exclusively of {@link MfMSection} elements, and
 * this parser must make sure that it is like that. To achive this, it creates
 * a section as "previous content" to start with, which can be used when
 * the document does not start with a heading.
 */
export class MfMContainerParser extends MfMParser<MfMContainer, MfMContainer, MfMOptionsParser | MfMSectionParser> {
	public readonly elementName = 'MfMContainer'

	create() {
		return new MfMContainer(this.parsers.idGenerator.nextId(), this, this.parsers['MfMSection'])
	}
	parseLine(previous: MfMContainer | null, text: string, start: number, length: number): MfMContainer | null {
		const container = previous ?? this.create()

		const { parsedLength } = this.parsers.MfMOptions.addOptionsTo(container, text, start, length, () => container.lines.push(new ParsedLine(container)))
		
		let result = parseBlock<MfMContainer, MfMBlockElements>(previous, container, text, start+parsedLength, length-parsedLength, this.allBlocks)
		if(result == null && isEmpty(text, start+parsedLength, length-parsedLength)) {
			//Add the empty line to the container
			result = container
			
			if(parsedLength === 0) { container.lines.push(new ParsedLine(container)) }
			result.lines[result.lines.length-1].content.push(new StringLineContent(text.substring(start+parsedLength, start+length), start+parsedLength, length-parsedLength, result))
		}

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

