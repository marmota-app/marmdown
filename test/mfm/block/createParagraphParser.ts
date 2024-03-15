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

import { IdGenerator, NumberedIdGenerator } from "../../../src/IdGenerator"
import { MfMParagraphParser } from "../../../src/mfm/block/MfMParagraph"
import { MfMContentLineParser } from "../../../src/mfm/inline/MfMContentLine"
import { MfMTextParser } from "../../../src/mfm/inline/MfMText"
import { MfMOptionsParser } from "../../../src/mfm/options/MfMOptions"
import { EmptyElementParser } from "../../../src/parser/EmptyElementParser"
import { Parsers } from "../../../src/parser/Parsers"
import { createEmphasisParser } from "../inline/createEmphasisParser"
import { createOptionsParser } from "../options/createOptionsParser"
import { createHeadingParser } from "./createHeadingParser"

export function createParagraphParser(emptyElementParser?: EmptyElementParser) {
	const idGenerator = new NumberedIdGenerator()
	emptyElementParser = emptyElementParser ?? new EmptyElementParser({ idGenerator })
	const parsers: Parsers<MfMContentLineParser | MfMOptionsParser> = {
		idGenerator,
		MfMContentLine: createContentLineParser(idGenerator),
		MfMOptions: createOptionsParser(idGenerator),
		allBlocks: [ emptyElementParser, createHeadingParser()['headingParser'], ],
	}
	const paragraphParser = new MfMParagraphParser(parsers)
	return { paragraphParser, idGenerator }
}

export function createContentLineParser(idGenerator: IdGenerator = new NumberedIdGenerator()) {
	const MfMEmphasis = createEmphasisParser(idGenerator)
	const MfMText = new MfMTextParser({ idGenerator })
	return new MfMContentLineParser({ idGenerator, MfMText, allInlines: [ MfMText, MfMEmphasis, ], allInnerInlines:[ MfMEmphasis, ], })
}
