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
export interface IndentedCodeBlock<
	THIS extends IndentedCodeBlock<THIS, CONTENT>,
	CONTENT extends Text<any>
> extends LeafBlock<THIS, CONTENT, 'indented-code-block'> {}
export interface FencedCodeBlock<
	THIS extends FencedCodeBlock<THIS, CONTENT>,
	CONTENT extends Text<any>
> extends LeafBlock<THIS, CONTENT, 'fenced-code-block'> {}
export interface LinkReference<
	THIS extends LinkReference<THIS, CONTENT, TEXT, DESTINATION, TITLE>,
	CONTENT extends TEXT | DESTINATION | TITLE,
	TEXT extends LinkText<TEXT, any>,
	DESTINATION extends LinkDestination<DESTINATION>,
	TITLE extends LinkTitle<TITLE>,
> extends LeafBlock<THIS, CONTENT, 'link-reference'>{}

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
export interface CodeSpan<THIS extends CodeSpan<THIS, CONTENT>, CONTENT extends Text<any>> extends ContainerInline<THIS, CONTENT, 'code-span'> {}

export interface Link<
	THIS extends Link<THIS, CONTENT, TEXT, DESTINATION, TITLE>,
	CONTENT extends TEXT | DESTINATION | TITLE,
	TEXT extends LinkText<TEXT, any>,
	DESTINATION extends LinkDestination<DESTINATION>,
	TITLE extends LinkTitle<TITLE>
> extends ContainerInline<THIS, CONTENT, 'link'> {
	readonly text?: TEXT,
	readonly destination?: DESTINATION,
	readonly title?: TITLE,
}
export interface Image<
	THIS extends Image<THIS, CONTENT, ALT_TEXT, DESTINATION, TITLE>,
	CONTENT extends ALT_TEXT | DESTINATION | TITLE,
	ALT_TEXT extends LinkText<ALT_TEXT, any>,
	DESTINATION extends LinkDestination<DESTINATION>,
	TITLE extends LinkTitle<TITLE>
> extends ContainerInline<THIS, CONTENT, 'image'> {
	readonly altText?: ALT_TEXT,
	readonly url?: URL,
	readonly title?: TITLE,
}
export interface LinkText<THIS extends LinkText<THIS, CONTENT>, CONTENT extends Inline<any, any, any, any>> extends ContainerInline<THIS, CONTENT, 'link-text'> {}
export interface LinkDestination<THIS extends LinkDestination<THIS>> extends LeafInline<THIS, 'link-destination'> {
	readonly target: string,
}
export interface LinkTitle<THIS extends LinkTitle<THIS>> extends LeafInline<THIS, 'link-title'> {
	readonly value: string,
}

export interface Text<THIS extends Text<THIS>> extends LeafInline<THIS, 'text'> {
	readonly text: string,
}
export interface HardLineBreak<THIS extends HardLineBreak<THIS>> extends LeafInline<THIS, 'line-break'> {}

export interface Empty<
	THIS extends Empty<THIS, CONTENT>,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
> extends LeafBlock<THIS, CONTENT, '--empty--'> {}
