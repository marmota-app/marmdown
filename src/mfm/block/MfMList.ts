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

import { MfMBlockElements } from "../../MfMDialect"
import { List } from "../../element/MarkdownElements"
import { MfMGenericContainerBlock } from "../MfMGenericElement"
import { MfMParser } from "../MfMParser"
import { EMPTY_OPTIONS_PARSER, MfMOptions } from "../options/MfMOptions"
import { MfMListItem } from "./MfMListItem"

export class MfMList extends MfMGenericContainerBlock<
	MfMList, MfMListItem, 'list', MfMListParser
> implements List<MfMList, MfMListItem> {
	#options = new MfMOptions('__empty__', EMPTY_OPTIONS_PARSER, true)

	protected self: MfMList = this
	constructor(public readonly listType: 'bullet' | 'ordered', id: string, pw: MfMListParser) { super(id, 'list', pw, false) }
	public override get options(): MfMOptions {
		//The options of the list are the options of the first list item!
		if(this.content.length > 0) {
			return this.content[0].options
		}
		return this.#options
	}
}

export class MfMListParser extends MfMParser<MfMList> {
	public readonly elementName = 'MfMList'

	create(listType: 'bullet' | 'ordered'): MfMList {
		return new MfMList(listType, this.parsers.idGenerator.nextId(), this)
	}

	parseLine(previous: MfMList | null, text: string, start: number, length: number): MfMList | null {
		return null
	}
}
