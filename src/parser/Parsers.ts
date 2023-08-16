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

import { Element } from '../element/Element'
import { IdGenerator } from '../IdGenerator'
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
export type Parsers<PARSER extends Parser<Element<unknown, unknown, unknown, unknown>>> = {
	[key in PARSER['elementName']]: Extract<PARSER, Record<'elementName', key>>
} & {
	/** A generator that can be used to generate new line ids and element
	 * ids. 
	 */
	idGenerator: IdGenerator,

	/** All known block parsers. */
	allBlocks?: Parser<Element<unknown, unknown, unknown, unknown>>[],
	/** All parsers for container blocks (blocks that can contain other
	 * blocks). 
	 */
	allContainerBlocks?: Parser<Element<unknown, unknown, unknown, unknown>>[],
	/** All parsers for leaf blocks (blocks that can only contain inline
	 * elements). 
	 */
	allLeafBlocks?: Parser<Element<unknown, unknown, unknown, unknown>>[],

	/** All known parsers for inline elements. */
	allInlines?: Parser<Element<unknown, unknown, unknown, unknown>>[],
	/** All parsers for inline elements that can be directly parsed by looking
	 * at the first few characters of the remaining text. 
	 */
	allInnerInlines?: Parser<Element<unknown, unknown, unknown, unknown>>[],
	/** All other inline parsers. */
	allOtherInlines?: Parser<Element<unknown, unknown, unknown, unknown>>[],
}
