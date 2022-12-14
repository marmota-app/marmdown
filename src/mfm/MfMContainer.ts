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

import { ContainerBlock, StringLineContent } from "$element/Element";
import { GenericBlock, GenericInline } from "$element/GenericElement";
import { Container, Paragraph, Section, Text } from "$element/MarkdownElements";

/**
 * Main container element for the "MfM" dialect. 
 */
export class MfMContainer extends GenericBlock<MfMContainer, MfMSection, 'container'> implements Container<MfMContainer, MfMSection> {
	constructor(id: string) { super(id, 'container') }
}

export class MfMSection extends GenericBlock<MfMSection, MfMSectionContent, 'section'> implements Section<MfMSection, MfMSectionContent> {
	constructor(id: string) { super(id, 'section') }
}

export class MfMParagraph extends GenericBlock<MfMParagraph, MfMParagraphContent, 'paragraph'> implements Paragraph<MfMParagraph, MfMParagraphContent> {
	constructor(id: string) { super(id, 'paragraph') }
}

export class MfMText extends GenericInline<MfMText, never, StringLineContent<MfMText>, 'text'> implements Text<MfMText> {
	constructor(id: string) { super(id, 'text') }
}

export type MfMSectionContent = MfMParagraph
export type MfMParagraphContent = MfMText
