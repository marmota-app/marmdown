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

import { IdGenerator } from "$markdown/IdGenerator";
import { Parsers } from "$parser/Parsers";
import { MfMSectionParser } from "./block/MfMSection";
import { MfMContainerParser } from "./MfMContainer";

export type MfMMetaBlock =
	MfMContainerParser |
	MfMSectionParser

export type MfMContainerBlock = never
export type MfMLeafBlock = never

export type MfMContainerInline = never
export type MfMLeafInline = never

export type KnownParsers =
	MfMMetaBlock //|
	//MfMContainerBlock |
	//MfMLeafBlock |
	//MfMContainerInline |
	//MfMLeafInline

/**
 * A class for accessing all known parsers that form the MfM markdown dialect,
 * used by {@link MfMDialect} to find its parsers. 
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

	private getParser<T extends KnownParsers>(name: T['elementName'], create: ()=>T): T {
		if(this.knownParsers[name] == null) {
			this.knownParsers[name] = create()
		}
		return this.knownParsers[name] as T
	}
}
