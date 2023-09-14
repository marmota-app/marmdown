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
import { MfMListItem } from "./MfMListItem"

export class MfMList extends MfMGenericContainerBlock<
	MfMList, MfMListItem, 'list', MfMListParser
> implements List<MfMList, MfMListItem> {
	protected self: MfMList = this
	constructor(id: string, pw: MfMListParser) { super(id, 'list', pw) }
}

export abstract class MfMListParser extends MfMParser<MfMList> {
	public readonly elementName = 'MfMListItem'

	parseLine(previous: MfMList | null, text: string, start: number, length: number): MfMList | null {
		return null
	}
}
