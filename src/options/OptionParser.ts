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
import { ParsedDocumentContent } from "$markdown/Updatable"

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

	parse(previous: Option | null, text: string, start: number, length: number): [Option | null, ParsedOptionContent | null] {
		if(previous != null) { return [ null, null] }
		
		let i = 0
		const parts: string[] = []
		const whenFound = (l: number, text: string) => { i+=l; parts.push(text) }

		const identMatcher = /[^ \n\r\t}=;]+/
		const valueMatcher = /[^\n\r}=;]+/
		const ident = find(text, identMatcher, start+i, length-i, { whenFound })
		if(ident) {
			const equals = find(text, '=', start+i, length-i, { whenFound })
			if(equals) {
				const value = find(text, valueMatcher, start+i, length-i, { whenFound })
				if(value) {
					const content = { key: ident.foundText, value: value.foundText.trim(), start: start, length: i, contained: [], asText: parts.join('') }
					const option = new UpdatableOption(
						content,
						this,
					)
					return [ option, content, ]
				}
			} else if(this.config.allowDefault) {
				const content = { key: 'default', value: ident.foundText, start: start, length: i, contained:[], asText: parts.join('') }
				const option = new UpdatableOption(
					content,
					this,
				)
				return [ option, content, ]
			}
		}

		return [ null, null, ]
	}
}
