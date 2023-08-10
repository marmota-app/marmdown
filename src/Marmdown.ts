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

import { ContainerBlock } from "$element/Element"
import { Dialect } from "$parser/Dialect"
import { ContentUpdate as ContentUpdate } from "./ContentUpdate"

/**
 * Main entry point for parsing and managing a single Markdown document. 
 * 
 * `Marmdown` holds the contents of a single markdown document as a tree of
 * {@link Element}s. It can update the document (when its contents did change,
 * e.g. because of a key stroke in an editor) and it can recreate the original
 * content from the element tree.
 * 
 * Each `Marmdown` option must now the dialect of the document it represents.
 * 
 * @param dialect The markdown dialect. 
*/
export class Marmdown<CONTAINER extends ContainerBlock<unknown, unknown, unknown>> {
	private _document: CONTAINER

	constructor(private readonly dialect: Dialect<CONTAINER>) {
		this._document = dialect.createEmptyDocument()
	}

	/**
	 * Try to update the document tree based on a {@link ContentUpdate},
	 * otherwise parse the complete document. 
	 * 
	 * This function uses the markdown dialect to try and update the existing
	 * document. If the markdown dialect cannot do that, it re-parses the
	 * complete document. To be able to re-parse, it calls the function
	 * `getCompleteText` (the second parameter) that must supply the complete
	 * text of the document.
	 * 
	 * @param update The {@link ContentUpdate} representing the update of the original content. 
	 * @param getCompleteText A function that can supply the complete text, if required
	 */
	update(update: ContentUpdate, getCompleteText: () => string) {
		const newDocument = this.dialect.parseUpdate(this._document, update)
		if(newDocument) {
			this._document = newDocument
		} else {
			this._document = this.#parseFully(getCompleteText())
		}
	}

	/**
	 * The text content of the document.
	 * 
	 * Setting the text content causes a complete re-parse of the document,
	 * and the previous document is discarded.
	 * 
	 * When the text content is read, it is always recreated from the element
	 * tree represented by `document`.
	 */
	set textContent(text: string) {
		this._document = this.#parseFully(text)
	}
	get textContent() {
		return this._document?.lines.map(l => l.asText).join('\n') ?? ''
	}

	/**
	 * The element tree representing the document. 
	 */
	get document(): CONTAINER | undefined {
		return this._document
	}

	#parseFully(text: string) {
		const container = this.dialect.parseCompleteText(text)
		return container
	}
}
