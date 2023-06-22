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

import { Marmdown } from "$markdown/Marmdown";
import { MfMBlockElements, MfMInlineElements } from "$markdown/MfMDialect";
import { MfMHeading } from "$mfm/block/MfMHeading";
import { MfMContainer } from "$mfm/MfMContainer";
import { MfMOptions } from "$mfm/options/MfMOptions";

export function html(document: Marmdown<MfMContainer>) {
	return document.document? all(document.document.content) : ''
}

function all(blocks: MfMBlockElements[]): string {
	return blocks.map(b => {
		switch(b.type) {
			case 'heading': return heading(b)
			case 'section': return all(b.content)
			case 'paragraph': return `<p${options(b)}>${inline(b.content)}</p>`
			case 'block-quote': return `<blockquote${options(b)}>\n${all(b.content)}\n</blockquote>`
			case 'aside': return `<aside${options(b)}>\n${all(b.content)}\n</aside>`
			case 'thematic-break': return `<hr${options(b)} />`
			case '--empty--': return ''
			default: throw new Error(`Unsupported inline element: ${(b as any).type}`)
		}
	}).join('\n')
}

function heading(heading: MfMHeading) {
	return `<h${heading.level}${options(heading)}>${inline(heading.content)}</h${heading.level}>`
}

function inline(inlines: MfMInlineElements[]): string {
	return inlines.map((element, index) => {
		switch(element.type) {
			case '--content-line--': return `${inline(element.content)}${index<inlines.length-1?'\n':''}`
			case 'text': return element.text
			case 'emphasis': return `<em>${inline(element.content)}</em>`
			case 'strong': return `<strong>${inline(element.content)}</strong>`
			case 'strike-through': return `<del>${inline(element.content)}</del>`
			case '--text-span--': return inline(element.content)
			default: throw new Error(`Unsupported inline element: ${(element as any).type}`)
		}
	}).join('')
}

function options(element: MfMBlockElements) {
	const options: MfMOptions | undefined = (element as any).options
	if(options && options.keys.length > 0) {
		const mappedOptions = options.keys.map(key => `${key}=${options.get(key)}`).join(';')
		return ` data-options="${mappedOptions}"`
	}
	return ``
}