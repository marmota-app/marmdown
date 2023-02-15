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

import { ContainerBlock, ParsedLine, StringLineContent } from "$element/Element";
import { GenericBlock, GenericInline } from "$element/GenericElement";
import { Container, Paragraph, Section, Text } from "$element/MarkdownElements";
import { IdGenerator } from "$markdown/IdGenerator";
import { MfMBlockElements } from "$markdown/MfMDialect";
import { isEmpty } from "$parser/find";
import { parseBlock } from "$parser/parse";
import { Parser } from "$parser/Parser";
import { Parsers } from "$parser/Parsers";
import { MfMSection, MfMSectionParser } from "./block/MfMSection";

/**
 * Main container element for the "MfM" dialect. 
 */
export class MfMContainer extends GenericBlock<MfMContainer, MfMBlockElements, 'container', MfMContainerParser> implements Container<MfMContainer, MfMBlockElements> {
	constructor(id: string, pw: MfMContainerParser) { super(id, 'container', pw) }
}

/**
 * Parse line content into `MfMContainer` (the main container type of the MfM dialect). 
 * 
 * A MfM document consists exclusively of {@link MfMSection} elements, and
 * this parser must make sure that it is like that. To achive this, it creates
 * a section as "previous content" to start with, which can be used when
 * the document does not start with a heading.
 */
export class MfMContainerParser extends Parser<MfMContainer> {
	public readonly elementName = 'MfMContainer'

	create() {
		return new MfMContainer(this.parsers.idGenerator.nextId(), this)
	}
	parseLine(previous: MfMContainer | null, text: string, start: number, length: number): MfMContainer | null {
		if(previous == null) {
			previous = this.create()
			previous.content.push(this.parsers['MfMSection'].create(1))
		}

		let result = parseBlock<MfMContainer, MfMBlockElements>(previous, text, start, length, this.create, this.allBlocks)
		if(result == null && isEmpty(text, start, length)) {
			result = previous
			//`previous` already has an empty line at the end, so there's no need
			//to add an empty line at the end, like
			//```result.lines.push(new ParsedLine(result))```
			//FIXME: Argh, I don't like that. The code here implicitly knows
			//       that `parseBlock` always adds an empty line. Actually,
			//       `parseBlock` should not do that. We should add the line
			//       here, like in the commented code above. But that's not an
			//       easy fix, so I am leaving it like this for now.
			result.lines[result.lines.length-1].content.push(new StringLineContent(text.substring(start, start+length), start, length, result))
		}
		if(result != null && result.content.length > 1 && result.content[0].content.length === 0) {
			result.content.shift()
		}

		return result
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }
}

