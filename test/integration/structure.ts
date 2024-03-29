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

import { Marmdown } from "../../src/Marmdown";
import { MfMBlockElements, MfMInlineElements } from "../../src/MfMDialect";
import { MfMAside } from "../../src/mfm/block/MfMAside";
import { MfMGeneralPurposeBlock } from "../../src/mfm/block/MfMGeneralPurposeBlock";
import { MfMHeading } from "../../src/mfm/block/MfMHeading";
import { MfMParagraph } from "../../src/mfm/block/MfMParagraph";
import { MfMSection } from "../../src/mfm/block/MfMSection";
import { MfMContainer } from "../../src/mfm/MfMContainer";
import { MfMOption } from "../../src/mfm/options/MfMOption";
import { MfMOptions } from "../../src/mfm/options/MfMOptions";

export function structure(document: Marmdown<MfMContainer>) {
	return document.document? all(document.document.content, 0) : ''
}

function all(blocks: MfMBlockElements[], indentation: number): string {
	return blocks.map(b => {
		switch(b.type) {
			case 'heading': return heading(b, indentation)
			case 'section': return section(b, indentation)
			case 'paragraph': return paragraph(b, indentation)
			case 'block-quote': return block(b, indentation)
			case 'aside': return aside(b, indentation)
			default: return ''
		}
	}).join('\n')
}

function heading(heading: MfMHeading, indentation: number) {
	return `${indent(indentation)}heading ${heading.level}\n${options(heading, indentation+1)}${inline(heading.content, indentation+1)}`
}

function section(section: MfMSection, indentation: number) {
	return `${indent(indentation)}section ${section.level}\n${options(section, indentation+1)}${all(section.content, indentation+1)}`
}

function paragraph(para: MfMParagraph, indentation: number) {
	return `${indent(indentation)}paragraph\n${options(para, indentation+1)}${inline(para.content, indentation+1)}`
}

function block(block: MfMGeneralPurposeBlock, indentation: number) {
	return `${indent(indentation)}block\n${options(block, indentation+1)}${all(block.content, indentation+1)}`
}

function aside(aside: MfMAside, indentation: number) {
	return `${indent(indentation)}aside\n${options(aside, indentation+1)}${all(aside.content, indentation+1)}`
}

function inline(inlines: MfMInlineElements[], indentation: number): string {
	return inlines.map(i => {
		switch(i.type) {
			case '--content-line--': return `${indent(indentation)}--content-line--\n${inline(i.content, indentation+1)}`
			case 'text': return `${indent(indentation)}text`
			default: return ''
		}
	}).join('\n')
}

function options(block: MfMBlockElements, indentation: number) {
	const options: MfMOptions | undefined = (block as any).options
	if(options && options.keys.length > 0) {
		const optionValues = options.content.map(opt => option(opt, indentation+1)).join('\n')
		return `${indent(indentation)}options\n${optionValues}\n`
	}
	return ``
}

function option(opt: MfMOption<any>, indentation: number) {
	return `${indent(indentation)}option[${opt.key}]`
}

function indent(i: number) {
	return new Array(i).fill('\t').join('')
}
