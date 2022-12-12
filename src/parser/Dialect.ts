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

import { ContentUpdate } from "$markdown/ContentUpdate";
import { ContainerBlock } from "$element/Element";

/**
 * Abstraction of all parsers that represent a markdown dialect. 
 * 
 * A markdown dialect is created by the sum of all parsers that can parse the
 * elements of that dialect. This interface abstracts those group of parsers:
 * To be a markdown dialect, it only has to be able to parse a document
 * completely and do parse an update to a document.
 * 
 * @category $parsers
 */
export interface Dialect<CONTAINER extends ContainerBlock<unknown>> {
	/**
	 * Create an empty document container. 
	 */
	createEmptyDocument(): CONTAINER

	/**
	 * Parse a markdown document completely. 
	 * @param text The complete original text of the document.
	 */
	parseCompleteText(text: string): CONTAINER

	/**
	 * Parse an update to a document, e.g. a key stroke in an editor. 
	 * 
	 * parseUpdate should try to parse only the innermost element that is
	 * affected by the update **and** can completely parse the update. In
	 * that case, it must return the same document object that it got as
	 * a parameter, but with a changed internal structure.
	 * 
	 * At any time, it can bail out and request re-parsing the complete
	 * document instead. In that case, it returns `null` to indicate that
	 * the document must be parsed completely.
	 * 
	 * See [parsing updates]{@tutorial parsing-updates}.
	 * 
	 * @param document The current state of the document, before the update.
	 * @param update The data structure representing the update.
	 * @returns A [`ContainerBlock`]{ContainerBlock} structure representing the new state of the document.
	 */
	parseUpdate(document: CONTAINER, update: ContentUpdate): CONTAINER | null
}
