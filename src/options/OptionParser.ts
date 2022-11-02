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
import { Option, ParsedOptionContent, UpdatableOption } from "$markdown/MarkdownOptions"
import { find } from "$markdown/parser/find"
import { ContainerTextParser } from "$markdown/parser/TextParser"
import { Parsers } from "$markdown/Parsers"
import { StringContent } from "$markdown/Updatable"

export interface OptionParserConfig {
	allowDefault: boolean,
}

/**
 * Parses a single `Option` that is either a default value or a "key=value" pair.
 * 
 * `Option` is a leaf node, so it does not have any content. Hence, the "C" type
 * parameter is `unknown`.
 */
export class OptionParser extends ContainerTextParser<unknown, Option, ParsedOptionContent> {
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

	override parse(previous: Option | null, text: string, start: number, length: number): [Option | null, ParsedOptionContent | null] {
		if(previous != null) { return [ null, null] }
		
		let i = 0
		const option = new UpdatableOption(this)
		const contained: StringContent<UpdatableOption>[] = []
		const whenFound = (l: number, text: string) => { contained.push(new StringContent<UpdatableOption>(text, i, l, option)); i+=l; }

		const identMatcher = /[^ \n\r\t}=;]+/
		const valueMatcher = /[^\n\r}=;]+/
		const ident = find(text, identMatcher, start+i, length-i, { whenFound })
		if(ident) {
			const equals = find(text, '=', start+i, length-i, { whenFound })
			if(equals) {
				const value = find(text, valueMatcher, start+i, length-i, { whenFound })
				if(value) {
					const content = new ParsedOptionContent(ident.foundText, value.foundText.trim(), start, i, option, contained)
					option.contents.push(content)
					return [ option, content, ]
				}
			} else if(this.config.allowDefault) {
				const content = new ParsedOptionContent('default', ident.foundText, start, i, option, contained)
				option.contents.push(content)
				return [ option, content, ]
			}
		}

		return [ null, null, ]
	}
}
