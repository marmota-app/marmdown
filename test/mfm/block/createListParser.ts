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

import { IdGenerator, NumberedIdGenerator } from "../../../src/IdGenerator";
import { MfMGeneralPurposeBlockParser } from "../../../src/mfm/block/MfMGeneralPurposeBlock";
import { MfMIndentedCodeBlockParser } from "../../../src/mfm/block/MfMIndentedCodeBlock";
import { MfMListParser } from "../../../src/mfm/block/MfMList";
import { MfMListItemParser } from "../../../src/mfm/block/MfMListItem";
import { MfMParagraphParser } from "../../../src/mfm/block/MfMParagraph";
import { MfMTextParser } from "../../../src/mfm/inline/MfMText";
import { MfMOptionsParser } from "../../../src/mfm/options/MfMOptions";
import { EmptyElementParser } from "../../../src/parser/EmptyElementParser";
import { Parsers } from "../../../src/parser/Parsers";
import { createOptionsParser } from "../options/createOptionsParser";
import { createParagraphParser } from "./createParagraphParser";

type RequiredParsers = MfMListItemParser | MfMListParser |  MfMOptionsParser | MfMParagraphParser | MfMGeneralPurposeBlockParser | MfMIndentedCodeBlockParser | EmptyElementParser | MfMTextParser

class TestParsers implements Parsers<RequiredParsers> {
	private knownParsers: { [key in (RequiredParsers)['elementName']]?: RequiredParsers } = {}
	
	constructor(public idGenerator: IdGenerator) {}

	get MfMListItem() { return this.getParser('MfMListItem', () => new MfMListItemParser(this)) }
	get MfMOptions() { return this.getParser('MfMOptions', () => createOptionsParser(this.idGenerator)) }
	get MfMList() { return this.getParser('MfMList', () => new MfMListParser(this)) }
	get MfMParagraph() { return this.getParser('MfMParagraph', () => createParagraphParser(this.EmptyElement).paragraphParser) }
	get MfMGeneralPurposeBlock() { return this.getParser('MfMGeneralPurposeBlock', () => new MfMGeneralPurposeBlockParser(this)) }
	get MfMIndentedCodeBlock() { return this.getParser('MfMIndentedCodeBlock', () => new MfMIndentedCodeBlockParser(this) )}
	get EmptyElement() { return this.getParser('EmptyElement', () => new EmptyElementParser(this)) }
	get MfMText() { return this.getParser('MfMText', () => new MfMTextParser(this)) }

	get allBlocks(): (MfMParagraphParser | MfMGeneralPurposeBlockParser | MfMIndentedCodeBlockParser | MfMListItemParser)[] {
		return [ this.MfMIndentedCodeBlock, this.MfMGeneralPurposeBlock, this.MfMListItem, this.MfMParagraph, ]
	}

	private getParser<T extends RequiredParsers>(name: T['elementName'], create: ()=>T): T {
		if(this.knownParsers[name] == null) {
			this.knownParsers[name] = create()
		}
		return this.knownParsers[name] as T
	}
}

export function createListItemParser(idGenerator = new NumberedIdGenerator()) {
	const parser = new TestParsers(idGenerator).MfMListItem
	return { parser, idGenerator }
}
