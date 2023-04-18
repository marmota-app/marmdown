/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

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

import { Block, Element } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { Parser } from "$parser/Parser"
import { EMPTY_OPTIONS_PARSER, MfMOptions } from "./options/MfMOptions"

/**
 * Abstract base class for MfM elements. 
 */
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

/**
 * Abstract base class for MfM elements that don't manage their line content directly. 
 * 
 * Elements that extend this base class handle content and content lines
 * differently than other elements: All line content of those elements is
 * derived directly from their content. So, they do not manipulate the line
 * content directly, they only add content. The line content is then always
 * created dynamically from the content.
 */
export abstract class MfMFlexibleGenericBlock<
	THIS extends Block<THIS, CONTENT, TYPE> | unknown,
	CONTENT extends Element<unknown, unknown, unknown, unknown> | unknown,
	TYPE extends string | unknown,
	PARSER extends Parser<THIS, Element<unknown, unknown, unknown, unknown>>,
> extends MfMGenericBlock<THIS, CONTENT, TYPE, PARSER> {
}
