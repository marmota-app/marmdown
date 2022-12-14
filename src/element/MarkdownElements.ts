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

import { Block, ContainerBlock, Element, Inline, LeafBlock, LeafInline, LineContent } from "./Element";

export interface Container<
	THIS extends Container<THIS, CONTENT>, 
	CONTENT extends Block<unknown, unknown, unknown>,
> extends ContainerBlock<THIS, CONTENT, 'container'> {}

export interface Section<
	THIS extends Section<THIS, CONTENT>, 
	CONTENT extends Block<unknown, unknown, unknown>,
> extends ContainerBlock<THIS, CONTENT, 'section'> {}

export interface Paragraph<
	THIS extends Paragraph<THIS, CONTENT>,
	CONTENT extends Inline<unknown, unknown, LineContent<unknown>, unknown>,
> extends LeafBlock<THIS, CONTENT, 'paragraph'> {}

export interface Text<THIS extends Text<THIS>> extends LeafInline<THIS, 'text'> {}