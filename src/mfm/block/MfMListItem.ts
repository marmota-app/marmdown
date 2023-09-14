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
import { ListItem } from "../../element/MarkdownElements"
import { EmptyElementParser } from "../../parser/EmptyElementParser"
import { MfMGenericContainerBlock } from "../MfMGenericElement"
import { MfMParser } from "../MfMParser"
import { MfMOptionsParser } from "../options/MfMOptions"
import { MfMList, MfMListParser } from "./MfMList"

export type MfMBlockElementContent = MfMBlockElements
export class MfMListItem extends MfMGenericContainerBlock<
	MfMListItem, MfMBlockElementContent, 'list-item', MfMListItemParser
> implements ListItem<MfMListItem, MfMBlockElementContent> {
	protected self: MfMListItem = this
	constructor(id: string, pw: MfMListItemParser) { super(id, 'list-item', pw) }
}

export abstract class MfMListItemParser extends MfMParser<MfMListItem, MfMList, MfMOptionsParser | EmptyElementParser | MfMListParser> {
	public readonly elementName = 'MfMListItem'

	parseLine(previous: MfMListItem | null, text: string, start: number, length: number): MfMList | null {
		return null
	}
}
