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

import { ContainerBlock, StringLineContent } from "$element/Element";
import { GenericBlock, GenericInline } from "$element/GenericElement";
import { Container, Paragraph, Section, Text } from "$element/MarkdownElements";
import { IdGenerator } from "$markdown/IdGenerator";
import { MfMBlockElements } from "$markdown/MfMDialect";
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
export class MfMContainerParser implements Parser<MfMContainer> {
	public readonly elementName = 'MfMContainer'
	constructor(private _parsers: Parsers<MfMSectionParser>) {}

	parseLine(previous: MfMContainer | null, text: string, start: number, length: number): MfMContainer | null {
		if(previous == null) {
			previous = new MfMContainer(this._parsers.idGenerator.nextId(), this)
			previous.content.push(this._parsers['MfMSection'].create(1))
		}

		//----------------------
		//--- Reusable code? ---
		if(this._parsers.allBlocks == null) { throw new Error('Could not parse: List of all blocks is not available.') }
		const container = previous ?? new MfMContainer(this._parsers.idGenerator.nextId(), this)

		const previousContent = container.content.length > 0? container.content[container.content.length-1] : null
		if(previousContent && !previousContent.isFullyParsed) {
			const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
			const content = parsedWith.parseLine(previousContent, text, start, length)
			if(content) {
				container.content.push(content)
				return container
			}
		}
		for(let i=0; i<this._parsers.allBlocks.length; i++) {
			const parser = this._parsers.allBlocks[i]
			const content = parser.parseLine(null, text, start, length) as MfMBlockElements
			if(content) {
				container.content.push(content)
				return container
			}	
		}

		return null
		//--- Reusable code? ---
		//----------------------
	}
}

