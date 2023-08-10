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

import { replaceEscaped } from "$markdown/escaping";
import { Marmdown } from "$markdown/Marmdown";
import { MfMBlockElements, MfMInlineElements } from "$markdown/MfMDialect";
import { MfMHeading } from "$mfm/block/MfMHeading";
import { MfMLinkReference } from "$mfm/block/MfMLinkReference";
import { MfMImage, MfMLink } from "$mfm/inline/link/MfMLink";
import { MfMContainer } from "$mfm/MfMContainer";
import { MfMOptions } from "$mfm/options/MfMOptions";

export function html(document: Marmdown<MfMContainer>) {
	return document.document? all(document.document.content, document.document.linkReferences) : ''
}

function error(message: string, element: never) {
	throw new Error(message)
}
function all(blocks: MfMBlockElements[], linkReferences: { [key: string]: MfMLinkReference }): string {
	return blocks.map(b => {
		switch(b.type) {
			case 'heading': return heading(b, linkReferences)
			case 'section': return all(b.content, linkReferences)
			case 'paragraph': return `<p${options(b)}>${inline(b.content, linkReferences)}</p>`
			case 'block-quote': return `<blockquote${options(b)}>\n${all(b.content, linkReferences)}\n</blockquote>`
			case 'aside': return `<aside${options(b)}>\n${all(b.content, linkReferences)}\n</aside>`
			case 'thematic-break': return `<hr${options(b)} />`
			case 'indented-code-block': return `<pre><code>${inline(b.content, linkReferences, '\n', false)}</code></pre>`
			case 'fenced-code-block': return `<pre><code${b.options.get('default')? ' class="language-'+b.options.get('default')+'"':''}>${inline(b.content, linkReferences, '\n', false)}</code></pre>`
			case 'link-reference': return ''
			case '--empty--': return ''
			default: error(`Unsupported block element: ${(b as any).type}`, b)
		}
	}).join('\n')
}

function heading(heading: MfMHeading, linkReferences: { [key: string]: MfMLinkReference }) {
	return `<h${heading.level}${options(heading)}>${inline(heading.content, linkReferences)}</h${heading.level}>`
}

function inline(inlines: MfMInlineElements[], linkReferences: { [key: string]: MfMLinkReference }, joinAfterText: string = '', escape: boolean = true): string {
	return inlines.map((element, index) => {
		switch(element.type) {
			case '--content-line--': return `${inline(element.content, linkReferences)}${index<inlines.length-1?'\n':''}`
			case 'text': return (escape? element.text : element.unescapedText)+joinAfterText
			case 'emphasis': return `<em>${inline(element.content, linkReferences)}</em>`
			case 'strong': return `<strong>${inline(element.content, linkReferences)}</strong>`
			case 'strike-through': return `<del>${inline(element.content, linkReferences)}</del>`
			case 'line-break': return '<br />'
			case 'code-span': return `<code>${inline(element.content, linkReferences, '', false)}</code>`
			case 'link-text': return inline(element.content, linkReferences)
			case 'link': return link(element, linkReferences)
			case 'image': return image(element, linkReferences)
			case '--text-span--': return inline(element.content, linkReferences)
			default: error(`Unsupported inline element: ${(element as any).type}`, element)
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

function link(element: MfMLink, linkReferences: { [key: string]: MfMLinkReference }) {
	if(element.references) {
		const id = element.references.normalized
		const ref = linkReferences[id]
		if(ref) {
			const text = element.text? inline(element.text.content, linkReferences) : ''
			const title = ref.title?.value ? ` title="${ref.title.value}"` : ''
			return `<a href="${encodeURI(ref.destination?.target ?? '')}"${title}>${text}</a>`
		}
	} else if(element.destination) {
		const text = element.text? inline(element.text.content, linkReferences) : ''
		const title = element.title?.value ? ` title="${element.title.value}"` : ''
		const url = element.destination?.target ?? ''

		return `<a href="${encodeURI(url)}"${title}>${text}</a>`
	}

	return replaceEscaped(element.lines[0].asSafeText)
}

function image(element: MfMImage, linkReferences: { [key: string]: MfMLinkReference }) {
	if(element.references) {
		const id = element.references.normalized
		const ref = linkReferences[id]
		if(ref) {
			const text = element.text? inline(element.text.content, linkReferences) : ''
			const title = ref.title?.value ? ` title="${ref.title.value}"` : ''
			return `<img src="${encodeURI(ref.destination?.target ?? '')}" alt="${text}"${title} />`
		}
	} else if(element.destination) {
		const text = element.text? inline(element.text.content, linkReferences) : ''
		const title = element.title?.value ? ` title="${element.title.value}"` : ''
		const url = element.destination?.target ?? ''

		return `<img src="${encodeURI(url)}" alt="${text}"${title} />`
	}

	return replaceEscaped(element.lines[0].asSafeText)
}
