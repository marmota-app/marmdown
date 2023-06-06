import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMParagraphParser } from "$mfm/block/MfMParagraph"
import { MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { EmptyElementParser } from "$parser/EmptyElementParser"
import { Parsers } from "$parser/Parsers"
import { createHeadingParser } from "./createHeadingParser"

export function createParagraphParser(emptyElementParser?: EmptyElementParser) {
	const idGenerator = new NumberedIdGenerator()
	emptyElementParser = emptyElementParser ?? new EmptyElementParser({ idGenerator })
	const parsers: Parsers<MfMContentLineParser> = {
		idGenerator,
		MfMContentLine: new MfMContentLineParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator }), ], }),
		allBlocks: [ emptyElementParser, createHeadingParser()['headingParser'], ]
	}
	const paragraphParser = new MfMParagraphParser(parsers)
	return { paragraphParser }
}
