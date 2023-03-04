import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMFirstOptionParser, MfMOptionParser } from "$mfm/options/MfMOption"
import { MfMOptionsParser } from "$mfm/options/MfMOptions"
import { Parsers } from "$parser/Parsers"

export function createOptionsParser(idGenerator = new NumberedIdGenerator()) {
	const parsers: Parsers<MfMOptionParser | MfMFirstOptionParser> = {
		idGenerator,
		MfMFirstOption: new MfMFirstOptionParser({ idGenerator }),
		MfMOption: new MfMOptionParser({ idGenerator }),
	}
	return new MfMOptionsParser(parsers)
}
