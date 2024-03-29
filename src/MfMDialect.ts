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

import { ContentUpdate } from "./ContentUpdate";
import { Dialect } from "./parser/Dialect";
import { MfMContainer, MfMContainerParser } from "./mfm/MfMContainer";
import { IdGenerator, NumberedIdGenerator } from "./IdGenerator";
import { LineByLineParser } from "./LineByLineParser";
import { MfMParsers } from "./mfm/MfMParsers";
import { MfMSection } from "./mfm/block/MfMSection";
import { MfMHeading, } from "./mfm/block/MfMHeading";
import { MfMParagraph } from "./mfm/block/MfMParagraph";
import { MfMText } from "./mfm/inline/MfMText";
import { UpdateParser } from "./UpdateParser";
import { MfMContentLine } from "./mfm/inline/MfMContentLine";
import { MfMGeneralPurposeBlock } from "./mfm/block/MfMGeneralPurposeBlock";
import { MfMAside } from "./mfm/block/MfMAside";
import { MfMThematicBreak } from "./mfm/block/MfMThematicBreak";
import { EmptyElement } from "./parser/EmptyElementParser";
import { MfMEmphasis, MfMStrikeThrough, MfMStrongEmphasis } from "./mfm/inline/MfMEmphasis";
import { MfMHardLineBreak } from "./mfm/inline/MfMHardLineBreak";
import { MfMCodeSpan } from "./mfm/inline/MfMCodeSpan";
import { MfMIndentedCodeBlock } from "./mfm/block/MfMIndentedCodeBlock";
import { MfMFencedCodeBlock } from "./mfm/block/MfMFencedCodeBlock";
import { TextSpan } from "./element/TextSpan";
import { MfMLinkText } from "./mfm/inline/link/MfMLinkText";
import { MfMImage, MfMLink } from "./mfm/inline/link/MfMLink";
import { MfMLinkReference } from "./mfm/block/MfMLinkReference";
import { MfMOptions } from "./mfm/options/MfMOptions";
import { MfMListItem } from "./mfm/block/MfMListItem";
import { MfMList } from "./mfm/block/MfMList";

export type MfMBlockElements =
	MfMSection |
	MfMHeading |
	MfMGeneralPurposeBlock |
	MfMAside |
	MfMListItem |
	MfMList |
	MfMParagraph |
	MfMThematicBreak |
	MfMIndentedCodeBlock |
	MfMFencedCodeBlock |
	MfMLinkReference |
	EmptyElement

export type MfMInlineElements =
	MfMContentLine |
	MfMEmphasis |
	MfMStrongEmphasis |
	MfMStrikeThrough |
	MfMCodeSpan |
	TextSpan<MfMInlineElements> |
	MfMHardLineBreak |
	MfMLinkText |
	MfMLink |
	MfMImage |
	MfMText

export type OptionsPostprocessor<T> = (element: T, options: MfMOptions, setOption: (key: string, value: string) => unknown) => unknown
export interface MfMDialectOptions {
	optionsPostprocessors?: { [key: string]: OptionsPostprocessor<any>[] }
}
/**
 * All known parsers for the "Marmota Flavored Markdown" dialect. 
 */
export class MfMDialect implements Dialect<MfMContainer> {
	constructor(
		private dialectOptions: MfMDialectOptions = {},
		private idGenerator: IdGenerator = new NumberedIdGenerator(),
		private parsers: MfMParsers = new MfMParsers(idGenerator, dialectOptions),
		private lineByLineParser: LineByLineParser<MfMContainer> = new LineByLineParser(parsers['MfMContainer']),
		private updateParser: UpdateParser<MfMContainer> = new UpdateParser(idGenerator),
	) {}

	createEmptyDocument(): MfMContainer {
		return this.parsers['MfMContainer'].create()
	}
	parseCompleteText(text: string): MfMContainer {
		const container = this.lineByLineParser.parse(text) ?? this.createEmptyDocument()
		container.updateLinkReferences()
		return container
	}
	parseUpdate(document: MfMContainer, update: ContentUpdate): MfMContainer | null {
		return this.updateParser.parse(document, update)
	}
}
