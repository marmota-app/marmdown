import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMHeadingParser } from "$mfm/block/MfMHeading"
import { MfMSectionParser } from "$mfm/block/MfMSection"
import { MfMContentLineParser } from "$mfm/inline/MfMContentLine"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { Parsers } from "$parser/Parsers"
import { createOptionsParser } from "../options/createOptionsParser"

export function createHeadingParser() {
	const idGenerator = new NumberedIdGenerator()
	const textParser = new MfMTextParser({ idGenerator })
	const tpParsers: Parsers<never> = { idGenerator, allInlines: [ textParser, ], }
	const contentLineParser = new MfMContentLineParser(tpParsers)

	const sectionParser = new MfMSectionParser({ idGenerator })

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
