import { AdvancedConent, Block, Content, DefaultContent, ToUpdatable } from "$markdown/MarkdownDocument"
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions"
import { find, skipSpaces } from "$markdown/parser/find"
import { ContainerTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { Parsers } from "$markdown/Parsers"
import { UpdatableContainerElement } from "$markdown/UpdatableElement"

export type UpdatableBlockContent = ToUpdatable<Content & DefaultContent>

export interface MdBlock extends Block, DefaultContent, AdvancedConent {
}

export class UpdatableBlock extends UpdatableContainerElement<UpdatableBlock, UpdatableBlockContent | Options | string> implements MdBlock {
	
	constructor(public readonly type: 'Blockquote' | 'Aside', private _content: UpdatableBlockContent[], public readonly allOptions: Options, _parts: (UpdatableBlockContent | Options | string)[], _start: number, parsedWith: BlockParser) {
		super(_parts, _start, parsedWith)
	}

	get options() { return this.allOptions.asMap }
	get hasChanged() { return false }
	get content() { return this._content }
}

export class BlockParser extends ContainerTextParser<UpdatableBlock, UpdatableBlockContent | Options | string> implements TextParser<UpdatableBlock> {
	//private textParser = new TextContentParser(), private newlineParser = new NewlineContentParser(), private optionsParser = new OptionsParser()
	constructor(private delimiter: string, private type: 'Blockquote' | 'Aside', private parsers: Parsers<'OptionsParser'>) { super() }

	parse(text: string, start: number, length: number): ParserResult<UpdatableBlock> | null {
		const parts: (UpdatableBlockContent | Options | string)[] = []
		const content: UpdatableBlockContent[] = []

		let i = 0
		const whenFound = (l: number, t: string) => { i+=l; parts.push(t) }

		let options = new UpdatableOptions([], -1)

		const delimiter = find(text, this.delimiter, start+i, length-i, { whenFound, maxLeadingSpaces: 3, })
		if(!delimiter) {
			return null
		}
		const optionsResult = this.parsers.knownParsers()['OptionsParser'].parse(text, start+i, length-i)
		if(optionsResult) {
			i += optionsResult.length
			options = optionsResult.content
			parts.push(options)
		}

		skipSpaces(text, start+i, length-i, { whenFound })

		for(let p=0; p<this.parsers.toplevel().length; p++) {
			const result = this.parsers.toplevel()[p].parse(text, start+i, length-i)

			if(result) {
				parts.push(result.content)
				content.push(result.content)
				i+=result.length
				break;
			}
		}

		return {
			startIndex: start,
			length: i,
			content: new UpdatableBlock(this.type, content, options, parts, start, this)
		}
	}
}
