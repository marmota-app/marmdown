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

import { TextSpanParser } from "../../../src/element/TextSpan"
import { IdGenerator, NumberedIdGenerator } from "../../../src/IdGenerator"
import { MfMEmphasisParser } from "../../../src/mfm/inline/MfMEmphasis"
import { MfMTextParser } from "../../../src/mfm/inline/MfMText"
import { MfMOptionsParser } from "../../../src/mfm/options/MfMOptions"
import { Parsers } from "../../../src/parser/Parsers"
import { createOptionsParser } from "../options/createOptionsParser"

type RequiredParsers = MfMTextParser | MfMEmphasisParser | MfMOptionsParser | TextSpanParser
class TestParsers implements Parsers<RequiredParsers> {
	private knownParsers: { [key in (RequiredParsers)['elementName']]?: RequiredParsers } = {}
	
	constructor(public idGenerator: IdGenerator) {}

	get MfMOptions() { return this.getParser('MfMOptions', () => createOptionsParser(this.idGenerator) )}
	get MfMEmphasis() { return this.getParser('MfMEmphasis', () => new MfMEmphasisParser(this))}
	get MfMText() { return this.getParser('MfMText', () => new MfMTextParser(this)) }
	get TextSpan() { return this.getParser('TextSpan', () => new TextSpanParser(this)) }

	get allInnerInlines(): (MfMTextParser | MfMEmphasisParser)[] { return [
		this.MfMEmphasis,
	] }
	get allInlines(): (MfMTextParser | MfMEmphasisParser)[] { return [this.MfMEmphasis, this.MfMText, ] }

	private getParser<T extends RequiredParsers>(name: T['elementName'], create: ()=>T): T {
		if(this.knownParsers[name] == null) {
			this.knownParsers[name] = create()
		}
		return this.knownParsers[name] as T
	}
}

export function createEmphasisParser(idGenerator: IdGenerator = new NumberedIdGenerator()) {
	return new TestParsers(idGenerator).MfMEmphasis
}
