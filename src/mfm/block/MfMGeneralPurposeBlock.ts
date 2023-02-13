import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { BlockQuote } from "$element/MarkdownElements"
import { MfMBlockElements } from "$markdown/MfMDialect"
import { parseBlock } from "$parser/parse"
import { Parser } from "$parser/Parser"
import { MfMBlockContentParser, MfMBlockElementContent } from "./MfMBlockContentParser"

export class MfMGeneralPurposeBlock extends GenericBlock<
	MfMGeneralPurposeBlock, MfMBlockElementContent, 'block-quote', MfMGeneralPurposeBlockParser
> implements BlockQuote<MfMGeneralPurposeBlock, MfMBlockElementContent> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: MfMGeneralPurposeBlockParser) { super(id, 'block-quote', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export class MfMGeneralPurposeBlockParser extends MfMBlockContentParser<MfMGeneralPurposeBlock, MfMGeneralPurposeBlockParser> {
	readonly token = '>'

	override create(): MfMGeneralPurposeBlock {
		return new MfMGeneralPurposeBlock(this.parsers.idGenerator.nextId(), this)
	}
}
