import { OptionParser } from "./options/OptionParser"
import { OptionsParser } from "./options/OptionsParser"
import { LineContentParser } from "./paragraph/LineContentParser"
import { NewlineContentParser } from "./paragraph/NewlineParser"
import { TextContentParser } from "./paragraph/TextContentParser"
import { TextParser } from "./parser/TextParser"
import { parsers, Parsers } from "./Parsers"
import { BlockParser } from "./toplevel/BlockParser"
import { FencedCodeBlockParser } from "./toplevel/FencedCodeBlockParser"
import { HeadingParser } from "./toplevel/HeadingParser"
import { ParagraphParser } from "./toplevel/ParagraphParser"
import { ThematicBreakParser } from "./toplevel/ThematicBreakParser"

export const ParserNames = [
	'HeadingParser',
	'ThematicBreakParser',
	'FencedCodeBlockParser',
	'ParagraphParser',
	'LineContentParser',
	'TextContentParser',
	'NewLineParser',
	'OptionsParser',
	'OptionParser',
	'DefaultOptionParser',
	'BlockQuoteParser',
	'AsideParser',
] as const
export type ParserName = (typeof ParserNames)[number]

export class MfMParsers implements Parsers<ParserName> {
	private _knownParsers?: { [key in ParserName]: TextParser<any>}
	private _toplevel?: TextParser<any>[]

	names() { return ParserNames }
	knownParsers(): { [key in ParserName]: TextParser<any>} {
		if(!this._knownParsers) {
			this._knownParsers = {
				'HeadingParser': new HeadingParser(this),
				'ThematicBreakParser': new ThematicBreakParser(this),
				'FencedCodeBlockParser': new FencedCodeBlockParser(this),
				'ParagraphParser': new ParagraphParser(this),
				'LineContentParser': new LineContentParser(this),
				'TextContentParser': new TextContentParser(this),
				'NewLineParser': new NewlineContentParser(this),
				'OptionsParser': new OptionsParser(this),
				'OptionParser': new OptionParser(this),
				'DefaultOptionParser': new OptionParser(this, { allowDefault: true, }),
				'BlockQuoteParser': new BlockParser('>', 'Blockquote', this),
				'AsideParser': new BlockParser('^', 'Aside', this),
			}
		}
		return this._knownParsers
	}
	toplevel() {
		if(!this._toplevel) {
			this._toplevel = parsers<ParserName>(this.knownParsers(), 
				[ 'HeadingParser', 'ThematicBreakParser', 'FencedCodeBlockParser', 'AsideParser', 'BlockQuoteParser', 'ParagraphParser', ])
		}
		return this._toplevel
	}
}
