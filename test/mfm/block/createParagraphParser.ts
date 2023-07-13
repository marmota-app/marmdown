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

import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMParagraphParser } from "$mfm/block/MfMParagraph"
import { MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { EmptyElementParser } from "$parser/EmptyElementParser"
import { Parsers } from "$parser/Parsers"
import { createEmphasisParser } from "../inline/createEmphasisParser"
import { createOptionsParser } from "../options/createOptionsParser"
import { createHeadingParser } from "./createHeadingParser"

export function createParagraphParser(emptyElementParser?: EmptyElementParser) {
	const idGenerator = new NumberedIdGenerator()
	emptyElementParser = emptyElementParser ?? new EmptyElementParser({ idGenerator })
	const MfMEmphasis = createEmphasisParser(idGenerator)
	const MfMText = new MfMTextParser({ idGenerator })
	const parsers: Parsers<MfMContentLineParser | MfMOptionsParser> = {
		idGenerator,
		MfMContentLine: new MfMContentLineParser({ idGenerator, MfMText, allInlines: [ MfMText, MfMEmphasis, ], allInnerInlines:[ MfMEmphasis, ], }),
		MfMOptions: createOptionsParser(idGenerator),
		allBlocks: [ emptyElementParser, createHeadingParser()['headingParser'], ],
	}
	const paragraphParser = new MfMParagraphParser(parsers)
	return { paragraphParser, idGenerator }
}
