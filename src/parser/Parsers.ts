/*
Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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

import { Element } from '$element/Element'
import { IdGenerator } from '$markdown/IdGenerator'
import { Parser } from './Parser'

/**
 * Obect type to access all known parsers of a markdown dialect. 
 * 
 * Whenever a parser of the dialect is needed, it can be accessed by querying
 * this object for the element type that the parser will generate, e.g.
 * when the dialect is marmota-flavored-markdown:
 * 
 * ```
 * const sectionParser = parsers.MfMSection
 * ```
 * 
 * See {@link MfMParsers} for how one could implement such an object type
 * as a class.
 */
export type Parsers<PARSER extends Parser<Element<unknown, unknown, unknown>>> = {
	[key in PARSER['elementName']]: PARSER
} & { 
	idGenerator: IdGenerator,

	allBlocks: Parser<Element<unknown, unknown, unknown>>[],
	allContainerBlocks: Parser<Element<unknown, unknown, unknown>>[],
	allLeafBlocks: Parser<Element<unknown, unknown, unknown>>[],

	allInlines: Parser<Element<unknown, unknown, unknown>>[],
	allContainerInlines: Parser<Element<unknown, unknown, unknown>>[],
	allLeafInlines: Parser<Element<unknown, unknown, unknown>>[],
}
