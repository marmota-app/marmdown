/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
import { AdvancedConent, Block, Content, DefaultContent, ToUpdatable } from "$markdown/MarkdownDocument"
import { Options, UpdatableOptions } from "$markdown/MarkdownOptions"
import { find, skipSpaces } from "$markdown/parser/find"
import { ContainerTextParser, defaultSkipLineStart, SkipLineStart, SkipLineStartOptions, TextParser } from "$markdown/parser/TextParser"
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
	get simplified() { return this._content.map(c => simplify(c)) } //FIXME remove!
}

function simplify(c: any): any { //FIXME remove!
	const simplifiedInner = c.content? 
		Array.isArray(c.content)? c.content.map((ic: any) => simplify(ic)): simplify(c.content)
		: undefined
	return typeof(c)==='object'? ({ ...c, content: simplifiedInner, parsedWith: undefined }) : c
}
export class BlockParser extends ContainerTextParser<UpdatableBlock, UpdatableBlockContent | Options | string> implements TextParser<UpdatableBlock> {
	constructor(private delimiter: string, private type: 'Blockquote' | 'Aside', private parsers: Parsers<'OptionsParser'>) { super() }

	parse(text: string, start: number, length: number, skipLineStart = defaultSkipLineStart): UpdatableBlock | null {
		const parts: (UpdatableBlockContent | Options | string)[] = []
		const content: UpdatableBlockContent[] = []

		let i = 0
		const whenFound = (l: number, t: string) => { i+=l; parts.push(t) }

		let options = new UpdatableOptions([], -1)

		const skip = skipLineStart(text, start+i, length-1, { whenSkipping: (text)=>parts.push(text) })
		if(!skip.isValidStart) { return null };
		i += skip.skipCharacters

		let delimiter = find(text, this.delimiter, start+i, length-i, { whenFound, maxLeadingSpaces: 3, })
		if(!delimiter) {
			return null
		}
		const optionsResult = this.parsers.knownParsers()['OptionsParser'].parse(text, start+i, length-i)
		if(optionsResult) {
			i += optionsResult.length
			options = optionsResult
			parts.push(options)
		}

		skipSpaces(text, start+i, length-i, { whenFound, maxLeadingSpaces: 1, })
		let startOfContent = start+i

		while(delimiter) {
			for(let p=0; p<this.parsers.toplevel().length; p++) {
				const result = this.parsers.toplevel()[p].parse(text, start+i, length-i, this.skipBlockLineStart(startOfContent, skipLineStart))
	
				if(result) {
					parts.push(result.content)
					content.push(result.content)
					i+=result.length
					break;
				}
			}
			find(text, /[\r\n]+/, start+i, length-i, { whenFound })

			const skip = skipLineStart(text, start+i, length-1, { whenSkipping: (text)=>parts.push(text) })
			if(!skip.isValidStart) { break };
			i += skip.skipCharacters
			while(find(text, new RegExp(`\\${this.delimiter}[ \t]*\r?\n`), start+i, length-i, { whenFound })) { 
				/* skipping empty line. must also skip the next line start again! */
				const skip = skipLineStart(text, start+i, length-1, { whenSkipping: (text)=>parts.push(text) })
				if(!skip.isValidStart) { break };
				i += skip.skipCharacters	
			}

			delimiter = find(text, this.delimiter, start+i, length-i, { whenFound, maxLeadingSpaces: 3, })
			if(!delimiter) {
				break
			}
			skipSpaces(text, start+i, length-i, { whenFound, maxLeadingSpaces: 1, })
			startOfContent = start+i
		}

		return new UpdatableBlock(this.type, content, options, parts, start, this)
	}

	private skipBlockLineStart = (startOfContent: number, outerSkipLineStart: SkipLineStart): SkipLineStart => {
		return (text: string, start: number, length: number, options?: SkipLineStartOptions) => {
			let i = start

			if(i===startOfContent) {
				return {
					isValidStart: true,
					skipCharacters: 0,
				}
			} else {
				const outerSkip = outerSkipLineStart(text, i, length, options)
				if(!outerSkip.isValidStart) {
					return outerSkip
				}
				i += outerSkip.skipCharacters

				const found = find(text, this.delimiter, i, length)
				if(found) {
					let spaces = 0
					skipSpaces(text, i+found.length, length-found.length, { maxLeadingSpaces: 1, whenFound: l => spaces=l, })
					options?.whenSkipping(found.completeText)
					return {
						isValidStart: true,
						skipCharacters: outerSkip.skipCharacters + found.length + spaces,
					}
				}
			}
			return {
				isValidStart: false,
				skipCharacters: 0,
			}
		}
	}
}
