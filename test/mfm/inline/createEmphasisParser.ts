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

import { IdGenerator, NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMEmphasisParser } from "$mfm/inline/MfMEmphasis"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { Parsers } from "$parser/Parsers"
import { createOptionsParser } from "../options/createOptionsParser"

class TestParsers implements Parsers<MfMTextParser | MfMEmphasisParser | MfMOptionsParser> {
	private knownParsers: { [key in (MfMTextParser | MfMEmphasisParser | MfMOptionsParser)['elementName']]?: MfMTextParser | MfMEmphasisParser | MfMOptionsParser } = {}
	
	constructor(public idGenerator: IdGenerator) {}

	get MfMOptions() { return this.getParser('MfMOptions', () => createOptionsParser(this.idGenerator) )}
	get MfMEmphasis() { return this.getParser('MfMEmphasis', () => new MfMEmphasisParser(this))}
	get MfMText() { return this.getParser('MfMText', () => new MfMTextParser(this)) }

	get allInnerInlines(): (MfMTextParser | MfMEmphasisParser)[] { return [
		this.MfMEmphasis,
	] }
	get allInlines(): (MfMTextParser | MfMEmphasisParser)[] { return [this.MfMEmphasis, this.MfMText, ] }

	private getParser<T extends MfMTextParser | MfMEmphasisParser | MfMOptionsParser>(name: T['elementName'], create: ()=>T): T {
		if(this.knownParsers[name] == null) {
			this.knownParsers[name] = create()
		}
		return this.knownParsers[name] as T
	}
}

export function createEmphasisParser(idGenerator: IdGenerator = new NumberedIdGenerator()) {
	return new TestParsers(idGenerator).MfMEmphasis
}
