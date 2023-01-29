import { Marmdown } from "$markdown/Marmdown";
import { MfMBlockElements, MfMInlineElements } from "$markdown/MfMDialect";
import { MfMHeading } from "$mfm/block/MfMHeading";
import { MfMContainer } from "$mfm/MfMContainer";

export function html(document: Marmdown<MfMContainer>) {
	return document.document? all(document.document.content) : ''
}

function all(blocks: MfMBlockElements[]): string {
	return blocks.map(b => {
		switch(b.type) {
			case 'heading': return heading(b)
			case 'section': return all(b.content)
			case 'paragraph': return `<p>\n${inline(b.content)}\n</p>`
			default: return ''
		}
	}).join('\n')
}

function heading(heading: MfMHeading) {
	return `<h${heading.level}>${inline(heading.content)}</h${heading.level}>`
}

function inline(inlines: MfMInlineElements[]): string {
	return inlines.map((element, index) => {
		switch(element.type) {
			case 'content-line': return `${inline(element.content)}${index<inlines.length-1?'\n':''}`
			case 'text': return element.text
			default: return ''
		}
	}).join('')
}
