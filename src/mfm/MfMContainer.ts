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
import { Parser } from "$parser/Parser";
import { Parsers } from "$parser/Parsers";
import { MfMSection, MfMSectionParser } from "./block/MfMSection";

export type MfMContainerContent = MfMSection
/**
 * Main container element for the "MfM" dialect. 
 */
export class MfMContainer extends GenericBlock<MfMContainer, MfMContainerContent, 'container'> implements Container<MfMContainer, MfMContainerContent> {
	constructor(id: string) { super(id, 'container') }
}

/**
 * Parse line content into `MfMContainer` (the main container type of the MfM dialect). 
 */
export class MfMContainerParser implements Parser<MfMContainer> {
	public readonly elementName = 'MfMContainer'
	constructor(private _parsers: Parsers<MfMSectionParser>) {}

	/** Lazily get section parser to avoid initializing everything in the constructor (might lead to stack overflow). */
	private get allParsers(): Parser<MfMContainerContent>[] { return [
		this._parsers.MfMSection,
	]}

	parseLine(previous: MfMContainer | null, text: string, start: number, length: number): MfMContainer | null {
		//----------------------
		//--- Reusable code? ---
		const container = previous ?? new MfMContainer(this._parsers.idGenerator.nextId())

		const previousContent = container.content.length > 0? container.content[container.content.length-1] : null
		if(previousContent && previousContent.parsedWith && !previousContent.isFullyParsed) {
			const content = previousContent.parsedWith.parseLine(previousContent, text, start, length)
			if(content) {
				container.content.push(content)
				return container
			}
		}
		for(let i=0; i<this.allParsers.length; i++) {
			const parser = this.allParsers[i]
			const content = parser.parseLine(null, text, start, length)
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

