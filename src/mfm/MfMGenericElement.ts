import { Block, Element } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Parser } from "$parser/Parser"
import { EMPTY_OPTIONS_PARSER, MfMOptions } from "./options/MfMOptions"

export abstract class MfMGenericBlock<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends GenericBlock<THIS, CONTENT, TYPE, PARSER> {
	private emptyOptions = new MfMOptions('__empty__', EMPTY_OPTIONS_PARSER, false)

	continueWithNextLine: boolean = true
	override get isFullyParsed(): boolean {
		//The element can only ever be fully parsed when the options are
		//already fully parsed!
		return this.options.isFullyParsed? !this.continueWithNextLine : false
	}
	get options(): MfMOptions {
		return this.lines[0]?.content?.find(c => c.belongsTo.type==='options')?.belongsTo as MfMOptions ?? this.emptyOptions
	}
}