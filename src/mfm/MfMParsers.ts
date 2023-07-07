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

import { IdGenerator } from "$markdown/IdGenerator";
import { EmptyElementParser } from "$parser/EmptyElementParser";
import { Parsers } from "$parser/Parsers";
import { MfMAsideParser } from "./block/MfMAside";
import { MfMGeneralPurposeBlockParser } from "./block/MfMGeneralPurposeBlock";
import { MfMHeadingParser, } from "./block/MfMHeading";
import { MfMParagraphParser } from "./block/MfMParagraph";
import { MfMSectionParser } from "./block/MfMSection";
import { MfMThematicBreakParser } from "./block/MfMThematicBreak";
import { MfMContentLineParser } from "./inline/MfMContentLine";
import { MfMEmphasisParser } from "./inline/MfMEmphasis";
import { MfMHardLineBreak, MfMHardLineBreakParser } from "./inline/MfMHardLineBreak";
import { MfMTextParser } from "./inline/MfMText";
import { MfMContainerParser } from "./MfMContainer";
import { MfMFirstOptionParser, MfMOptionParser } from "./options/MfMOption";
import { MfMOptionsParser } from "./options/MfMOptions";

export type MfMMetaBlock =
	MfMContainerParser |
	MfMSectionParser

export type MfMContainerBlock =
	MfMGeneralPurposeBlockParser |
	MfMAsideParser

export type MfMLeafBlock =
	MfMHeadingParser |
	MfMParagraphParser |
	MfMThematicBreakParser |
	EmptyElementParser

export type MfMInnerInline =
	MfMEmphasisParser |
	MfMHardLineBreakParser

export type MfMOtherInline =
	MfMContentLineParser |
	MfMTextParser

export type MfMOptions =
	MfMFirstOptionParser |
	MfMOptionParser |
	MfMOptionsParser

export type KnownParsers =
	MfMMetaBlock |
	MfMContainerBlock |
	MfMLeafBlock |
	MfMInnerInline |
	MfMOtherInline |
	MfMOptions

/**
 * A class for accessing all known parsers that form the MfM markdown dialect,
 * used by {@link ../MfMDialect} to find its parsers. 
 * 
 * All parsers are initialized lazily to avoid creating all parsers when
 * creating this object, which might result in a stack overflow considering
 * the dependencies the parsers have on each other.
 */
export class MfMParsers implements Parsers<KnownParsers> {
	private knownParsers: { [key in KnownParsers['elementName']]?: KnownParsers } = {}

	constructor(public readonly idGenerator: IdGenerator) {}

	get MfMContainer() { return this.getParser('MfMContainer', () => new MfMContainerParser(this)) }
	get MfMSection() { return this.getParser('MfMSection', () => new MfMSectionParser(this)) }

	get MfMParagraph() { return this.getParser('MfMParagraph', () => new MfMParagraphParser(this)) }
	get MfMHeading() { return this.getParser('MfMHeading', () => new MfMHeadingParser(this)) }
	get MfMThematicBreak() { return this.getParser('MfMThematicBreak', () => new MfMThematicBreakParser(this)) }
	
	get MfMContentLine() { return this.getParser('MfMContentLine', () => new MfMContentLineParser(this)) }

	get MfMGeneralPurposeBlock() { return this.getParser('MfMGeneralPurposeBlock', () => new MfMGeneralPurposeBlockParser(this)) }
	get MfMAside() { return this.getParser('MfMAside', () => new MfMAsideParser(this))}
	
	get MfMFirstOption() { return this.getParser('MfMFirstOption', () => new MfMFirstOptionParser(this))}
	get MfMOption() { return this.getParser('MfMOption', () => new MfMOptionParser(this))}
	get MfMOptions() { return this.getParser('MfMOptions', () => new MfMOptionsParser(this))}
	
	get EmptyElement() { return this.getParser('EmptyElement', () => new EmptyElementParser(this))}

	get MfMEmphasis() { return this.getParser('MfMEmphasis', () => new MfMEmphasisParser(this))}
	get MfMText() { return this.getParser('MfMText', () => new MfMTextParser(this)) }

	get MfMHardLineBreak() { return this.getParser('MfMHardLineBreak', () => new MfMHardLineBreakParser(this)) }

	get allBlocks(): KnownParsers[] { return [ ...this.allContainerBlocks, ...this.allLeafBlocks, ] }
	get allContainerBlocks(): KnownParsers[] { return [
		//EmptyElement has priority over all other blocks: When a line is
		//empty, it is never part of another element.
		this.EmptyElement,
		this.MfMGeneralPurposeBlock,
		this.MfMAside,
		//IMPORTANT: Meta blocks like this.MfMContainer or this.MfMSection must
		//           not be part of this list, because they are created on-the-fly
		//           when needed by other parsers. Parsing them explicitly would
		//           create infiniterecursion or unnecessarily nested blocks.
	] }
	get allLeafBlocks(): KnownParsers[] { return [
		//IMPORTANT: Options are not part of leaf blocks!
		this.MfMHeading,
		this.MfMParagraph,
		this.MfMThematicBreak,
	] }

	get allInlines(): KnownParsers[] { return [ ...this.allInnerInlines, ...this.allOtherInlines, ] }
	get allInnerInlines(): KnownParsers[] { return [
		this.MfMEmphasis,
		this.MfMHardLineBreak,
	] }
	get allOtherInlines(): KnownParsers[] { return [
		//MfMContentLine is not part of this list because it will never be
		//parsed directly by iterating over one of those lists.
		this.MfMText,
	] }

	private getParser<T extends KnownParsers>(name: T['elementName'], create: ()=>T): T {
		if(this.knownParsers[name] == null) {
			this.knownParsers[name] = create()
		}
		return this.knownParsers[name] as T
	}
}
