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
			default: return ''
		}
	}).join('\n')
}

function heading(heading: MfMHeading) {
	return `<h${heading.level}>${inline(heading.content)}</h${heading.level}>`
}

function inline(inlines: MfMInlineElements[]): string {
	return inlines.map(i => {
		switch(i.type) {
			case 'heading-text': return inline(i.content)
			case 'text': return i.text
			default: return ''
		}
	}).join('')
}
