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
import { ContentChange } from "$markdown/ContentChange"
import { Option, UpdatableOption } from "$markdown/MarkdownOptions"
import { find } from "$markdown/parser/find"
import { LeafTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { Parsers } from "$markdown/Parsers"

export interface OptionParserConfig {
	allowDefault: boolean,
}
export class OptionParser extends LeafTextParser<Option> implements TextParser<Option> {
	private config: OptionParserConfig

	constructor(_: Parsers<never>, config: Partial<OptionParserConfig> = {}) {
		super()

		const defaultConfig: OptionParserConfig = {
			allowDefault: false,
		}
		this.config = {
			...defaultConfig,
			...config,
		}
	}

	parse(text: string, start: number, length: number): ParserResult<Option> | null {
		let i = 0
		const whenFound = (l: number) => i+=l

		const identMatcher = /[^ \n\r\t}=;]+/
		const valueMatcher = /[^\n\r}=;]+/
		const ident = find(text, identMatcher, start+i, length-i, { whenFound })
		if(ident) {
			const equals = find(text, '=', start+i, length-i, { whenFound })
			if(equals) {
				const value = find(text, valueMatcher, start+i, length-i, { whenFound })
				if(value) {
					return {
						startIndex: start,
						length: i,
						content: new UpdatableOption(
							text.substring(start, start+i),
							ident.foundText,
							value.foundText.trim(),
							start, i,
							this,
						),
					}
				}
			} else if(this.config.allowDefault) {
				return {
					startIndex: start,
					length: i,
					content: new UpdatableOption(
						text.substring(start, start+i),
						'default',
						ident.foundText,
						start, i,
						this,
					),
				}
			}
		}

		return null
	}
}
