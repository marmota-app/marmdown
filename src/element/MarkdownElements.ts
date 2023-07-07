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

import { ContentUpdate } from "$markdown/ContentUpdate";
import { Block, ContainerBlock, ContainerInline, Element, Inline, LeafBlock, LeafInline, LineContent } from "./Element";

export interface Container<
	THIS extends Container<THIS, CONTENT>, 
	CONTENT extends Block<unknown, unknown, unknown>,
> extends ContainerBlock<THIS, CONTENT, 'container'> {}

export interface Section<
	THIS extends Section<THIS, CONTENT>, 
	CONTENT extends Block<unknown, unknown, unknown>,
> extends ContainerBlock<THIS, CONTENT, 'section'> {}

export interface Heading<
	THIS extends Heading<THIS, CONTENT>,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
> extends LeafBlock<THIS, CONTENT, 'heading'> {}

export interface ThematicBreak<
	THIS extends ThematicBreak<THIS>,
> extends LeafBlock<THIS, never, 'thematic-break'> {}

export interface Paragraph<
	THIS extends Paragraph<THIS, CONTENT>,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
> extends LeafBlock<THIS, CONTENT, 'paragraph'> {}

export interface BlockQuote<
	THIS extends BlockQuote<THIS, CONTENT>,
	CONTENT extends Block<unknown, unknown, unknown>,
> extends ContainerBlock<THIS, CONTENT, 'block-quote'> {}

export interface Aside<
	THIS extends Aside<THIS, CONTENT>,
	CONTENT extends Block<unknown, unknown, unknown>,
> extends ContainerBlock<THIS, CONTENT, 'aside'> {}

export interface Emphasis<
	THIS extends Emphasis<THIS, CONTENT>, CONTENT extends Inline<any, any, any, any>
> extends ContainerInline<THIS, CONTENT, 'emphasis'> {}
export interface StrongEmphasis<
	THIS extends StrongEmphasis<THIS, CONTENT>, CONTENT extends Inline<any, any, any, any>
> extends ContainerInline<THIS, CONTENT, 'strong'> {}
export interface StrikeThrough<
	THIS extends StrikeThrough<THIS, CONTENT>, CONTENT extends Inline<any, any, any, any>
> extends ContainerInline<THIS, CONTENT, 'strike-through'> {}

export interface Text<THIS extends Text<THIS>> extends LeafInline<THIS, 'text'> {
	readonly text: string,
}

export interface HardLineBreak<THIS extends HardLineBreak<THIS>> extends LeafInline<THIS, 'line-break'> {
}

export interface Empty<
	THIS extends Empty<THIS, CONTENT>,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
> extends LeafBlock<THIS, CONTENT, '--empty--'> {}
