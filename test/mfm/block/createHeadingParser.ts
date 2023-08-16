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

import { Element } from "../../../src/element/Element"
import { NumberedIdGenerator } from "../../../src/IdGenerator"
import { MfMHeadingParser } from "../../../src/mfm/block/MfMHeading"
import { MfMSectionParser } from "../../../src/mfm/block/MfMSection"
import { MfMContentLineParser } from "../../../src/mfm/inline/MfMContentLine"
import { MfMTextParser } from "../../../src/mfm/inline/MfMText"
import { MfMOptionsParser } from "../../../src/mfm/options/MfMOptions"
import { Parser } from "../../../src/parser/Parser"
import { Parsers } from "../../../src/parser/Parsers"
import { createOptionsParser } from "../options/createOptionsParser"

export function createHeadingParser(sectionBlockParsers: Parser<Element<unknown, unknown, unknown, unknown>>[] = []) {
	const idGenerator = new NumberedIdGenerator()
	const textParser = new MfMTextParser({ idGenerator })
	const tpParsers: Parsers<MfMTextParser> = { idGenerator, MfMText: textParser, allInlines: [ textParser, ], }
	const contentLineParser = new MfMContentLineParser(tpParsers)

	const sectionParser = new MfMSectionParser({ idGenerator, allBlocks: sectionBlockParsers })

	const optionsParser = createOptionsParser(idGenerator)
	const parsers: Parsers<MfMSectionParser | MfMContentLineParser | MfMOptionsParser> = {
		idGenerator,
		'MfMSection': sectionParser,
		'MfMContentLine': contentLineParser,
		'MfMOptions': optionsParser,
	}

	const headingParser = new MfMHeadingParser(parsers)

	return { headingParser, sectionParser, }
}
