import { IdGenerator, NumberedIdGenerator } from "../../../../src/IdGenerator"
import { MfMCellParser } from "../../../../src/mfm/block/table/MfMCell"
import { MfMDelimiterCellParser } from "../../../../src/mfm/block/table/MfMDelimiterCell"
import { RequiredParsers as DelimiterRequiredParsers, MfMDelimiterRowParser } from "../../../../src/mfm/block/table/MfMDelimiterRow"
import { MfMHeaderRowParser, RequiredParsers as RequiredHeaderRowParsers } from "../../../../src/mfm/block/table/MfMHeaderRow"
import { MfMTableParser, RequiredParsers as TableRequiredParsers } from "../../../../src/mfm/block/table/MfMTable"
import { MfMContentLineParser } from "../../../../src/mfm/inline/MfMContentLine"
import { MfMOptionsParser } from "../../../../src/mfm/options/MfMOptions"
import { Parsers } from "../../../../src/parser/Parsers"
import { createOptionsParser } from "../../options/createOptionsParser"
import { createContentLineParser } from "../createParagraphParser"

export function createHeaderRowParser(
		idGenerator: IdGenerator = new NumberedIdGenerator(),
		optionsParser: MfMOptionsParser = createOptionsParser(idGenerator),
	) {
	const requiredParsers: Parsers<RequiredHeaderRowParsers> = {
		'MfMOptions': optionsParser,
		'MfMTableCell': new MfMCellParser({ idGenerator, MfMContentLine: createContentLineParser(idGenerator) }),
		allBlocks: [],
		idGenerator,
	}
	return new MfMHeaderRowParser(requiredParsers)
}

export function createDelimiterRowParser(
		idGenerator: IdGenerator = new NumberedIdGenerator(),
		optionsParser: MfMOptionsParser = createOptionsParser(idGenerator),
	) {
	const requiredParsers: Parsers<DelimiterRequiredParsers> = {
		'MfMOptions': optionsParser,
		'MfMTableDelimiterCell': new MfMDelimiterCellParser({ idGenerator }),
		allBlocks: [],
		idGenerator,
	}
	return new MfMDelimiterRowParser(requiredParsers)
}

	export function createTableParser(
		idGenerator: IdGenerator = new NumberedIdGenerator(),
		optionsParser: MfMOptionsParser = createOptionsParser(idGenerator),
	) {
	const parsersForRows: Parsers<DelimiterRequiredParsers | RequiredHeaderRowParsers> = {
		'MfMOptions': optionsParser,
		'MfMTableDelimiterCell': new MfMDelimiterCellParser({ idGenerator }),
		'MfMTableCell': new MfMCellParser({ idGenerator, MfMContentLine: createContentLineParser(idGenerator) }),
		allBlocks: [],
		idGenerator,
	}
	const requiredParsers: Parsers<TableRequiredParsers> = {
		'MfMOptions': optionsParser,
		'MfMTableDelimiterRow': new MfMDelimiterRowParser(parsersForRows),
		'MfMTableHeaderRow': new MfMHeaderRowParser(parsersForRows),
		allBlocks: [],
		idGenerator,
	}
	return new MfMTableParser(requiredParsers)
}
