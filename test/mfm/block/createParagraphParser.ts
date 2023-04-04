import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMParagraphParser } from "$mfm/block/MfMParagraph"
import { MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { Parsers } from "$parser/Parsers"
import { createHeadingParser } from "./createHeadingParser"

export function createParagraphParser() {
	const idGenerator = new NumberedIdGenerator()
	const parsers: Parsers<MfMContentLineParser> = {
		idGenerator,
		MfMContentLine: new MfMContentLineParser({ idGenerator, allInlines: [ new MfMTextParser({ idGenerator }), ], }),
		allBlocks: [ createHeadingParser()['headingParser'], ]
	}
	const paragraphParser = new MfMParagraphParser(parsers)
	return { paragraphParser }
}
