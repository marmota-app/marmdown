import { Marmdown } from "$markdown/Marmdown";
import { MfMBlockElements } from "$markdown/MfMDialect";
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
	console.log(heading)
	//TODO map content of heading, but first implement MfMTextParser!
	return `<h${heading.level}></h${heading.level}>`
}