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

/**
 * Main container element for the "MfM" dialect. 
 */
export class MfMContainer extends GenericBlock<MfMContainer, MfMSection, 'container'> implements Container<MfMContainer, MfMSection> {
	constructor(id: string) { super(id, 'container') }
}

/**
 * Parse line content into `MfMContainer` (the main container type of the MfM dialect). 
 */
export class MfMContainerParser implements Parser<MfMContainer> {
	public readonly elementName = 'MfMContainer'
	constructor(private parsers: Parsers<MfMSectionParser>) {}

	/** Lazily get section parser to avoid initializing everything in the constructor (might lead to stack overflow). */
	get sectionParser(): MfMSectionParser { return this.parsers.MfMSection }

	parseLine(previous: MfMContainer | null, text: string, start: number, length: number): MfMContainer | null {
		this.sectionParser.parseLine(null, text, start, length)

		return null
	}
}

