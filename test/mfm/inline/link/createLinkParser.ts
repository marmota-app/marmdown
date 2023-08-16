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

import { TextSpanParser } from "../../../../src/element/TextSpan"
import { IdGenerator, NumberedIdGenerator } from "../../../../src/IdGenerator"
import { MfMLinkReferenceParser } from "../../../../src/mfm/block/MfMLinkReference"
import { MfMEmphasisParser } from "../../../../src/mfm/inline/MfMEmphasis"
import { MfMTextParser } from "../../../../src/mfm/inline/MfMText"
import { MfMLinkParser } from "../../../../src/mfm/inline/link/MfMLink"
import { MfMLinkDestinationParser } from "../../../../src/mfm/inline/link/MfMLinkDestination"
import { MfMLinkTextParser } from "../../../../src/mfm/inline/link/MfMLinkText"
import { MfMLinkTitleParser } from "../../../../src/mfm/inline/link/MfMLinkTitle"
import { MfMOptionsParser } from "../../../../src/mfm/options/MfMOptions"
import { Parsers } from "../../../../src/parser/Parsers"
import { createOptionsParser } from "../../options/createOptionsParser"

type RequiredParsers = MfMTextParser | MfMEmphasisParser | MfMOptionsParser
	| MfMLinkParser | MfMLinkTextParser | MfMLinkTitleParser | MfMLinkDestinationParser
	| TextSpanParser | MfMLinkReferenceParser
	
class TestParsers implements Parsers<RequiredParsers> {
	private knownParsers: { [key in (RequiredParsers)['elementName']]?: RequiredParsers } = {}
	
	constructor(public idGenerator: IdGenerator) {}

	get MfMOptions() { return this.getParser('MfMOptions', () => createOptionsParser(this.idGenerator) )}
	get MfMEmphasis() { return this.getParser('MfMEmphasis', () => new MfMEmphasisParser(this))}
	get MfMText() { return this.getParser('MfMText', () => new MfMTextParser(this)) }
	get MfMLinkText() { return this.getParser('MfMLinkText', () => new MfMLinkTextParser(this)) }
	get MfMLinkTitle() { return this.getParser('MfMLinkTitle', () => new MfMLinkTitleParser(this)) }
	get MfMLinkDestination() { return this.getParser('MfMLinkDestination', () => new MfMLinkDestinationParser(this)) }
	get MfMLink() { return this.getParser('MfMLink', () => new MfMLinkParser(this)) }
	get TextSpan() { return this.getParser('TextSpan', () => new TextSpanParser(this)) }
	get MfMLinkReference() { return this.getParser('MfMLinkReference', () => new MfMLinkReferenceParser(this)) }

	get allInnerInlines(): (MfMTextParser | MfMEmphasisParser | MfMLinkParser)[] { return [
		this.MfMEmphasis,
		this.MfMLink,
	] }
	get allInlines(): (MfMTextParser | MfMEmphasisParser | MfMLinkParser)[] { return [this.MfMEmphasis, this.MfMLink, this.MfMText, ] }

	private getParser<T extends RequiredParsers>(name: T['elementName'], create: ()=>T): T {
		if(this.knownParsers[name] == null) {
			this.knownParsers[name] = create()
		}
		return this.knownParsers[name] as T
	}
}
export function createLinkParser(idGenerator = new NumberedIdGenerator()) {
	const testParsers = new TestParsers(idGenerator)

	const linkParser = testParsers.MfMLink
	const linkTextParser = testParsers.MfMLinkText
	const linkDestinationParser = testParsers.MfMLinkDestination
	const linkTitleParser = testParsers.MfMLinkTitle

	return { linkParser, linkTextParser, linkDestinationParser, linkTitleParser, idGenerator, }
}

export function createLinkTextParser(idGenerator = new NumberedIdGenerator()) {
	const linkTextParser = new TestParsers(idGenerator).MfMLinkText
	return { linkTextParser, idGenerator, }
}

export function createLinkDestinationParser(idGenerator = new NumberedIdGenerator()) {
	const linkDestinationParser = new TestParsers(idGenerator).MfMLinkDestination
	return { linkDestinationParser, idGenerator, }
}

export function createLinkTitleParser(idGenerator = new NumberedIdGenerator()) {
	const linkTitleParser = new TestParsers(idGenerator).MfMLinkTitle
	return { linkTitleParser, idGenerator, }
}

export function createLinkReferenceParser(idGenerator = new NumberedIdGenerator()) {
	const linkReferenceParser = new TestParsers(idGenerator).MfMLinkReference
	return { linkReferenceParser, idGenerator, }
}
