import { GenericBlock } from "$element/GenericElement"
import { Aside, BlockQuote } from "$element/MarkdownElements"
import { MfMBlockContentParser, MfMBlockElementContent } from "./MfMBlockContentParser"

export class MfMAside extends GenericBlock<
	MfMAside, MfMBlockElementContent, 'aside', MfMAsideParser
> implements Aside<MfMAside, MfMBlockElementContent> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: MfMAsideParser) { super(id, 'aside', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export class MfMAsideParser extends MfMBlockContentParser<MfMAside, MfMAsideParser> {
	public readonly elementName = 'MfMAside'
	readonly token = '^'

	override create(): MfMAside {
		return new MfMAside(this.parsers.idGenerator.nextId(), this)
	}
}
