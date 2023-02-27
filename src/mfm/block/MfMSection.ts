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

import { ParsedLine } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Section } from "$element/MarkdownElements"
import { MfMBlockElements } from "$markdown/MfMDialect"
import { parseBlock } from "$parser/parse"
import { Parser } from "$parser/Parser"

export type MfMSectionContent = MfMBlockElements
export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section', MfMSectionParser> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string, pw: MfMSectionParser, public readonly level: number = 1) { super(id, 'section', pw) }

	sectionCompleted: boolean = false
	override get isFullyParsed() { return this.sectionCompleted }
}

export class MfMSectionParser extends Parser<MfMSection> {
	public readonly elementName = 'MfMSection'

	create(level: number = 1) {
		return new MfMSection(this.parsers.idGenerator.nextId(), this, level)
	}

	parseLine(previous: MfMSection | null, text: string, start: number, length: number): MfMSection | null {
		const result = parseBlock<MfMSection, MfMSectionContent>(previous, text, start, length, this.create.bind(this), this.allBlocks, this.endsPrevious)

		return result
	}

	override parseLineUpdate(original: MfMSection, text: string, start: number, length: number): ParsedLine<unknown, unknown> | null {
		//A section cannot be updated directly, only its contents can be updated.
		//When an update bubbles up to this point, it is better to re-parse the
		//whole document (or at least to re-parse the container that contains
		//this section), so the section parser returns null here.
		return null
	}

	private endsPrevious(previous: MfMSection, content: MfMSectionContent) {
		if(content.type === 'section') {
			return content.level <= previous.level
		}
		return false
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }
}
