import { Marmdown } from "$markdown/Marmdown";
import { MfMBlockElements, MfMInlineElements } from "$markdown/MfMDialect";
import { MfMHeading } from "$mfm/block/MfMHeading";
import { MfMSection } from "$mfm/block/MfMSection";
import { MfMContainer } from "$mfm/MfMContainer";

export function structure(document: Marmdown<MfMContainer>) {
	return document.document? all(document.document.content, 0) : ''
}

function all(blocks: MfMBlockElements[], indentation: number): string {
	return blocks.map(b => {
		switch(b.type) {
			case 'heading': return heading(b, indentation)
			case 'section': return section(b, indentation)
			default: return ''
		}
	}).join('\n')
}

function heading(heading: MfMHeading, indentation: number) {
	return `${indent(indentation)}heading ${heading.level}\n${inline(heading.content, indentation+1)}`
}

function section(section: MfMSection, indentation: number) {
	return `${indent(indentation)}section ${section.level}\n${all(section.content, indentation+1)}`
}

function inline(inlines: MfMInlineElements[], indentation: number): string {
	return inlines.map(i => {
		switch(i.type) {
			case 'content-line': return `${indent(indentation)}heading-text\n${inline(i.content, indentation+1)}`
			case 'text': return `${indent(indentation)}text`
			default: return ''
		}
	}).join('\n')
}

function indent(i: number) {
	return new Array(i).fill('\t').join('')
}
