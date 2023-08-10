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

import { JSDOM } from 'jsdom'
import fs from 'fs'

import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "../html"

interface ImplementedExample {
	name: string,
	reason: string,
}
interface ImplementedSection {
	chapter: string,
	name: string,
	notYetImplemented: ImplementedExample[],
	incompatible: ImplementedExample[],
}

const __escaping_special__ = 'Escaping special characters is not yet implemented'
const __leading__ = 'Leading spaces are not yet removed correctly'

const __links_in_headings__ = 'Links in headings are not yet implemented'

const __fenced__ = 'Fenced code blocks are not yet implemented'
const __indented_code_blocks__ = 'Indented code blocks are not yet implemented'
const __inline_code__ = 'Inline code elements are not yet implemented'

const __hard_break__ = 'Hard line breaks (<br/>) are not yet implemented'
const __paragraph_indentation__ = 'Indentation after the first line of a paragraph is not yet removed correctly'
const __lists__ = 'Lists are not yet implemented'

const __autolinks__ = 'Autolinks <in angle brackets> are not yet implemented'
const __entity_references__ = 'Entity references are not yet fully supported'

//Known / intended incompatibilities
const __laziness__ = 'Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented'
const __setext_headings__ = 'Setext headings are not supported'
const __html_content__ = 'HTML content is not supported in MfM'
const __delimiters_left_to_right__ = 'In MfM, delimiters are matched left-to-right, not inside-out'
const __multiline_inline__ = 'MfM does not support multi-line inline content'
const __strike_through_incompatibility__ = 'In MfM, strike-through behaves like other emphasis, allowing multiple, nested elements'
const __spaces__ = 'In MfM, spaces are usually not removed at the end of a line'
const __line_break_end_of_block__ = 'In MfM, hard line breaks are always added, even at the end of a block'
const __tabs_expansion_after_character__ = 'MfM never expands tabs, not even after the list character or block character'
const __autolinks_extension_incompatible__ = "MfM does not support the autolinks extension, which tries to recognize links in plain text"
const __multiline_link_reference__ = "MfM does not support multiline link references"
const __unescaped_backslash__ = "In MfM, all backslashes must be escaped, even if they would be unambiguous in GfM"
const __link_destination_unescaped_parens__ = 'MfM does not allow unescaped parenthesis in link destinations, even when they are balanced'
const __links_left_to_right__ = 'In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not'

const implementedSections: ImplementedSection[] = [
	{ chapter: '1.1', name: 'What is GitHub Flavored Markdown?', notYetImplemented: [], incompatible: []},
	{ chapter: '1.2', name: 'What is Markdown?', notYetImplemented: [], incompatible: []},
	{ chapter: '1.3', name: 'Why is a spec needed?', notYetImplemented: [], incompatible: []},
	{ chapter: '1.4', name: 'About this document', notYetImplemented: [], incompatible: []},
	{ chapter: '2.1', name: 'Characters and lines', notYetImplemented: [], incompatible: []},
	{ 
		chapter: '2.2', name: 'Tabs',
		notYetImplemented: [
			{ name: 'Example 1', reason: __indented_code_blocks__ },
			{ name: 'Example 2', reason: __indented_code_blocks__ },
			{ name: 'Example 3', reason: __indented_code_blocks__ },
			{ name: 'Example 9', reason: __lists__ },
			{ name: 'Example 8', reason: __indented_code_blocks__ },
		],
		incompatible: [
			{ name: 'Example 4', reason: __laziness__ },
			{ name: 'Example 5', reason: __laziness__ },
			{ name: 'Example 6', reason: __tabs_expansion_after_character__ },
			{ name: 'Example 7', reason: __tabs_expansion_after_character__ },
		]
	},
	{ chapter: '2.3', name: 'Insecure Characters - Incompatible!', notYetImplemented: [], incompatible: []},
	{ chapter: '3.2', name: 'Container blocks and leaf blocks', notYetImplemented: [], incompatible: []},
	{
		chapter: '4.1', name: 'Thematic breaks',
		notYetImplemented: [
			{ name: 'Example 18', reason: __indented_code_blocks__ },
			{ name: 'Example 19', reason: __paragraph_indentation__ },
			{ name: 'Example 26', reason: __paragraph_indentation__ },
			{ name: 'Example 27', reason: __lists__ },
			{ name: 'Example 30', reason: __lists__ },
			{ name: 'Example 31', reason: __lists__ },
		],
		incompatible: [
			{ name: 'Example 29', reason: __setext_headings__ },
		],
	},
	{ 
		chapter: '4.2', name: 'ATX headings',
		notYetImplemented: [
			{ name: 'Example 35', reason: __escaping_special__ },
			{ name: 'Example 36', reason: __escaping_special__ },
			{ name: 'Example 37', reason: 'Leading & trailing whitespace for headings is not yet removed' },
			{ name: 'Example 38', reason: 'Indentation for headings is not yet supported' },
			{ name: 'Example 39', reason: __fenced__ },
			{ name: 'Example 40', reason: __leading__ },
			{ name: 'Example 41', reason: 'Optional closing sequences are not yet supported' },
			{ name: 'Example 42', reason: 'Optional closing sequences are not yet supported' },
			{ name: 'Example 43', reason: 'Optional closing sequences are not yet supported' },
			{ name: 'Example 46', reason: __escaping_special__ },
			{ name: 'Example 49', reason: 'Optional closing sequences are not yet supported' },
		],
		incompatible: [],
	},
	{
		chapter: '4.3', name: 'Setext headings - Incompatible!',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 50', reason: __setext_headings__ },
			{ name: 'Example 51', reason: __setext_headings__ },
			{ name: 'Example 52', reason: __setext_headings__ },
			{ name: 'Example 53', reason: __setext_headings__ },
			{ name: 'Example 54', reason: __setext_headings__ },
			{ name: 'Example 55', reason: __setext_headings__ },
			{ name: 'Example 56', reason: __setext_headings__ },
			{ name: 'Example 57', reason: __setext_headings__ },
			{ name: 'Example 58', reason: __setext_headings__ },
			{ name: 'Example 59', reason: __setext_headings__ },
			{ name: 'Example 60', reason: __setext_headings__ },
			{ name: 'Example 61', reason: __setext_headings__ },
			{ name: 'Example 62', reason: __setext_headings__ },
			{ name: 'Example 63', reason: __setext_headings__ },
			{ name: 'Example 64', reason: __setext_headings__ },
			{ name: 'Example 65', reason: __setext_headings__ },
			{ name: 'Example 66', reason: __setext_headings__ },
			{ name: 'Example 67', reason: __setext_headings__ },
			{ name: 'Example 68', reason: __setext_headings__ },
			{ name: 'Example 69', reason: __setext_headings__ },
			{ name: 'Example 70', reason: __setext_headings__ },
			{ name: 'Example 71', reason: __setext_headings__ },
			{ name: 'Example 72', reason: __setext_headings__ },
			{ name: 'Example 73', reason: __setext_headings__ },
			{ name: 'Example 74', reason: __setext_headings__ },
			{ name: 'Example 75', reason: __setext_headings__ },
			{ name: 'Example 76', reason: __setext_headings__ },
		]
	},
	{
		chapter: '4.4', name: 'Indented code blocks',
		notYetImplemented: [
			{ name: 'Example 78', reason: __lists__ },
			{ name: 'Example 79', reason: __lists__ },
			{ name: 'Example 83', reason: __paragraph_indentation__ },
		],
		incompatible: [
			{ name: 'Example 85', reason: __setext_headings__ },
		]
	},
	{
		chapter: '4.5', name: 'Fenced code blocks',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 91', reason: __multiline_inline__ },
			{ name: 'Example 111', reason: __setext_headings__ },
		]
	},
	{
		chapter: '4.6', name: 'HTML blocks',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 118', reason: __html_content__ },
			{ name: 'Example 119', reason: __html_content__ },
			{ name: 'Example 120', reason: __html_content__ },
			{ name: 'Example 121', reason: __html_content__ },
			{ name: 'Example 122', reason: __html_content__ },
			{ name: 'Example 123', reason: __html_content__ },
			{ name: 'Example 124', reason: __html_content__ },
			{ name: 'Example 125', reason: __html_content__ },
			{ name: 'Example 126', reason: __html_content__ },
			{ name: 'Example 127', reason: __html_content__ },
			{ name: 'Example 128', reason: __html_content__ },
			{ name: 'Example 129', reason: __html_content__ },
			{ name: 'Example 130', reason: __html_content__ },
			{ name: 'Example 131', reason: __html_content__ },
			{ name: 'Example 132', reason: __html_content__ },
			{ name: 'Example 133', reason: __html_content__ },
			{ name: 'Example 134', reason: __html_content__ },
			{ name: 'Example 135', reason: __html_content__ },
			{ name: 'Example 136', reason: __html_content__ },
			{ name: 'Example 137', reason: __html_content__ },
			{ name: 'Example 138', reason: __html_content__ },
			{ name: 'Example 139', reason: __html_content__ },
			{ name: 'Example 140', reason: __html_content__ },
			{ name: 'Example 141', reason: __html_content__ },
			{ name: 'Example 142', reason: __html_content__ },
			{ name: 'Example 143', reason: __html_content__ },
			{ name: 'Example 144', reason: __html_content__ },
			{ name: 'Example 145', reason: __html_content__ },
			{ name: 'Example 146', reason: __html_content__ },
			{ name: 'Example 147', reason: __html_content__ },
			{ name: 'Example 148', reason: __html_content__ },
			{ name: 'Example 149', reason: __html_content__ },
			{ name: 'Example 150', reason: __html_content__ },
			{ name: 'Example 151', reason: __html_content__ },
			{ name: 'Example 152', reason: __html_content__ },
			{ name: 'Example 153', reason: __html_content__ },
			{ name: 'Example 154', reason: __html_content__ },
			{ name: 'Example 155', reason: __html_content__ },
			{ name: 'Example 156', reason: __html_content__ },
			{ name: 'Example 157', reason: __html_content__ },
			{ name: 'Example 158', reason: __html_content__ },
			{ name: 'Example 159', reason: __html_content__ },
			{ name: 'Example 160', reason: __html_content__ },
		]
	},
	{
		chapter: '4.7', name: 'Link reference definitions',
		notYetImplemented: [
			{ name: 'Example 183', reason: __links_in_headings__ },
		],
		incompatible: [
			{ name: 'Example 162', reason: __multiline_link_reference__ },
			{ name: 'Example 163', reason: __link_destination_unescaped_parens__ },
			{ name: 'Example 164', reason: __multiline_link_reference__ },
			{ name: 'Example 165', reason: __multiline_link_reference__ },
			{ name: 'Example 167', reason: __multiline_link_reference__ },
			{ name: 'Example 170', reason: __html_content__ },
			{ name: 'Example 171', reason: __unescaped_backslash__ },
			{ name: 'Example 177', reason: __multiline_link_reference__ },
			{ name: 'Example 184', reason: __multiline_link_reference__ },
			{ name: 'Example 186', reason: __multiline_link_reference__ },
		]
	},
	{ 
		chapter: '4.8', name: 'Paragraphs',
		notYetImplemented: [
			{ name: 'Example 192', reason: __leading__ },
			{ name: 'Example 193', reason: __paragraph_indentation__ },
			{ name: 'Example 194', reason: __leading__ },
			{ name: 'Example 195', reason: __fenced__ },
			{ name: 'Example 196', reason: __hard_break__ },
		],
		incompatible: [],
	},
	{ chapter: '4.9', name: 'Blank lines', notYetImplemented: [], incompatible: [] },
	{ 
		chapter: '5.1', name: 'Block quotes',
		notYetImplemented: [
			{ name: 'Example 208', reason: __leading__ },
			{ name: 'Example 209', reason: __fenced__ },
			{ name: 'Example 230', reason: __indented_code_blocks__ },
		],
		incompatible: [
			{ name: 'Example 210', reason: __laziness__ },
			{ name: 'Example 211', reason: __laziness__ },
			{ name: 'Example 212', reason: __laziness__ },
			{ name: 'Example 213', reason: __laziness__ },
			{ name: 'Example 214', reason: __laziness__ },
			{ name: 'Example 215', reason: __laziness__ },
			{ name: 'Example 216', reason: __laziness__ },
			{ name: 'Example 225', reason: __laziness__ },
			{ name: 'Example 228', reason: __laziness__ },
			{ name: 'Example 229', reason: __laziness__ },
		]
	},
	{
		chapter: '6.3', name: 'Code spans',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 345', reason: __multiline_inline__ },
			{ name: 'Example 346', reason: __multiline_inline__ },
			{ name: 'Example 347', reason: __multiline_inline__ },
			{ name: 'Example 353', reason: __html_content__ },
			{ name: 'Example 354', reason: __html_content__ },
			{ name: 'Example 355', reason: __html_content__ },
			{ name: 'Example 356', reason: __html_content__ },
		]
	},
	{
		chapter: '6.4', name: 'Emphasis and strong emphasis',
		notYetImplemented: [
			{ name: 'Example 446', reason: __escaping_special__ },
			{ name: 'Example 449', reason: __escaping_special__ },
			{ name: 'Example 458', reason: __escaping_special__ },
			{ name: 'Example 461', reason: __escaping_special__ },
			{ name: 'Example 487', reason: __inline_code__ },
			{ name: 'Example 488', reason: __inline_code__ }
		],
		incompatible: [
			{ name: 'Example 403', reason: __multiline_inline__ },
			{ name: 'Example 414', reason: __multiline_inline__ },
			{ name: 'Example 417', reason: __delimiters_left_to_right__ },
			{ name: 'Example 420', reason: __delimiters_left_to_right__ },
			{ name: 'Example 421', reason: __delimiters_left_to_right__ },
			{ name: 'Example 424', reason: __delimiters_left_to_right__ },
			{ name: 'Example 432', reason: __multiline_inline__ },
			{ name: 'Example 439', reason: __delimiters_left_to_right__ },
			{ name: 'Example 441', reason: __multiline_inline__ },
			{ name: 'Example 451', reason: __delimiters_left_to_right__ },
			{ name: 'Example 454', reason: __delimiters_left_to_right__ },
			{ name: 'Example 463', reason: __delimiters_left_to_right__ },
			{ name: 'Example 466', reason: __delimiters_left_to_right__ },
			{ name: 'Example 484', reason: __html_content__ },
			{ name: 'Example 485', reason: __html_content__ },
			{ name: 'Example 486', reason: __html_content__ },
			{ name: 'Example 489', reason: __html_content__ },
			{ name: 'Example 490', reason: __html_content__ },
		]
	},
	{
		chapter: '6.5', name: 'Strikethrough (extension)',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 493', reason: __strike_through_incompatibility__ },
		]
	},
	{
		chapter: '6.6', name: 'Links',
		notYetImplemented: [
			{ name: 'Example 512', reason: __entity_references__ },
			{ name: 'Example 515', reason: __entity_references__ },
			{ name: 'Example 535', reason: __autolinks__ },
			{ name: 'Example 547', reason: __autolinks__ },
		],
		incompatible: [
			{ name: 'Example 501', reason: __html_content__ },
			{ name: 'Example 504', reason: __html_content__ },
			{ name: 'Example 506', reason: __link_destination_unescaped_parens__ },
			{ name: 'Example 511', reason: __unescaped_backslash__ },
			{ name: 'Example 513', reason: 'MfM never tries to parse quoted strings as destinations' },
			{ name: 'Example 516', reason: 'MfM treats all whitespace equally for links' },
			{ name: 'Example 519', reason: __multiline_inline__ },
			{ name: 'Example 527', reason: 'In MfM, links can contain other links' },
			{ name: 'Example 528', reason: 'In MfM, links can contain other links' },
			{ name: 'Example 529', reason: 'In MfM, links can contain other links' },
			{ name: 'Example 532', reason: __links_left_to_right__ },
			{ name: 'Example 533', reason: __html_content__ },
			{ name: 'Example 541', reason: 'In MfM, links can contain other links' },
			{ name: 'Example 542', reason: 'In MfM, links can contain other links' },
			{ name: 'Example 545', reason: __html_content__ },
			{ name: 'Example 549', reason: 'MfM does not use unicode case fold' },
			{ name: 'Example 550', reason: __multiline_link_reference__ },
			{ name: 'Example 556', reason: __links_left_to_right__ },
			{ name: 'Example 557', reason: __links_left_to_right__ },
			{ name: 'Example 561', reason: __multiline_inline__ },
			{ name: 'Example 565', reason: 'MfM preserves whitespace at the end of the line, which the test does not expect.' },
			{ name: 'Example 568', reason: __links_left_to_right__ },
			{ name: 'Example 577', reason: __links_left_to_right__ },
			{ name: 'Example 578', reason: __links_left_to_right__ },
			{ name: 'Example 579', reason: __links_left_to_right__ },
			{ name: 'Example 580', reason: __links_left_to_right__ },
		]
	},
	{
		chapter: '6.7', name: 'Images',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 582', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 583', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 584', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 585', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 586', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 594', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 596', reason: 'MfM preserves whitespace at the end of the line, which the test does not expect.' },
			{ name: 'Example 598', reason: 'In MfM, alt text is not re-processed just for the sake of the test' },
			{ name: 'Example 599', reason: 'In MfM, labels can contain brackets' },
		]
	},
	{
		chapter: '6.9', name: 'Autolinks (extension)',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 622', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 623', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 624', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 625', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 626', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 627', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 628', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 629', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 630', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 631', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 632', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 633', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 634', reason: __autolinks_extension_incompatible__ },
			{ name: 'Example 635', reason: __autolinks_extension_incompatible__ },
		]
	},
	{
		chapter: '6.10', name: 'Raw HTML',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 636', reason: __html_content__ },
			{ name: 'Example 637', reason: __html_content__ },
			{ name: 'Example 638', reason: __html_content__ },
			{ name: 'Example 639', reason: __html_content__ },
			{ name: 'Example 640', reason: __html_content__ },
			{ name: 'Example 641', reason: __html_content__ },
			{ name: 'Example 642', reason: __html_content__ },
			{ name: 'Example 643', reason: __html_content__ },
			{ name: 'Example 644', reason: __html_content__ },
			{ name: 'Example 645', reason: __html_content__ },
			{ name: 'Example 646', reason: __html_content__ },
			{ name: 'Example 647', reason: __html_content__ },
			{ name: 'Example 648', reason: __html_content__ },
			{ name: 'Example 649', reason: __html_content__ },
			{ name: 'Example 650', reason: __html_content__ },
			{ name: 'Example 651', reason: __html_content__ },
			{ name: 'Example 652', reason: __html_content__ },
			{ name: 'Example 653', reason: __html_content__ },
			{ name: 'Example 654', reason: __html_content__ },
			{ name: 'Example 655', reason: __html_content__ },
			{ name: 'Example 656', reason: __html_content__ },
		]
	},
	{
		chapter: '6.11', name: 'Disallowed Raw HTML (extension)',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 657', reason: __html_content__ },
		]
	},
	{
		chapter: '6.12', name: 'Hard line breaks',
		notYetImplemented: [
			{ name: 'Example 661', reason: __leading__ },
			{ name: 'Example 662', reason: __leading__ },
			{ name: 'Example 665', reason: __inline_code__ },
			{ name: 'Example 666', reason: __inline_code__ },
		],
		incompatible: [
			{ name: 'Example 663', reason: __multiline_inline__ },
			{ name: 'Example 664', reason: __multiline_inline__ },
			{ name: 'Example 667', reason: __html_content__ },
			{ name: 'Example 668', reason: __html_content__ },
			{ name: 'Example 669', reason: __line_break_end_of_block__ },
			{ name: 'Example 670', reason: __line_break_end_of_block__ },
			{ name: 'Example 671', reason: __line_break_end_of_block__ },
		]
	},
	{
		chapter: '6.13', name: 'Soft line breaks',
		notYetImplemented: [],
		incompatible: [
			{ name: 'Example 674', reason: __spaces__ + '/' + __leading__ },
		]
	},
	{
		chapter: '6.14', name: 'Textual content',
		notYetImplemented: [],
		incompatible: []
	}
]

const compatibility: string[] = []
describe('Github-flavored-Markdown (GfM) compatibility', () => {
	const marmdown = new Marmdown(new MfMDialect())

	const gfmSpecContent = fs.readFileSync('test/integration/gfm/GitHub Flavored Markdown Spec.html', 'utf-8')
	const gfmSpec = new JSDOM(gfmSpecContent)
	

	compatibility.push('# Markdown compatibility')
	compatibility.push('')

	findTestsFrom(gfmSpec.window.document.body.children)
	
	if(process.env.WRITE_COMPAT_INFO) {
		fs.writeFileSync('./docs/github-flavored-markdown-compatibility.md', compatibility.join('\n'))
	}

	function describeSection(children: HTMLCollection, startIndex: number, sectionInfo?: ImplementedSection) {
		return () => {
			for(let i=startIndex; i < children.length; i++) {
				const child = children[i]
	
				if(child.nodeName === 'H1' || child.nodeName === 'H2') { return }
	
				if(child.nodeName === 'DIV' && child.classList.contains('example')) {
					const example = withoutEmptyLines(child.querySelector('.examplenum')?.textContent)
					const md = child.querySelector('.language-markdown')?.textContent
						?.replaceAll('→', '\t')
					const html = child.querySelector('.language-html')?.textContent
						?.replaceAll('→', '\t')
	
					if(example != null && md != null && html != null) {
						testExample(example, md, html, sectionInfo)
					}
				}
			}
		}
	}
	
	function testExample(name: string, md: string, expected: string, sectionInfo?: ImplementedSection) {
		if(sectionInfo?.notYetImplemented.filter(nyi => nyi.name === name)?.length??0 > 0) {
			const info = sectionInfo?.notYetImplemented?.filter(nyi => nyi.name === name)[0] as ImplementedExample
			compatibility.push('* '+info.name+': '+info.reason+';  ')
			writeExample('Markdown input', 'markdown', md)
			writeExample('Expected HTML', 'html', expected)
			it.skip(name+'(-- '+info.reason+' --)', () => {
				marmdown.textContent = md
				expect(withoutEmptyLines(html(marmdown))).toEqual(withoutEmptyLines(expected))
			})
		} else if(sectionInfo?.incompatible.filter(nyi => nyi.name === name)?.length??0 > 0) {
			const info = sectionInfo?.incompatible?.filter(nyi => nyi.name === name)[0] as ImplementedExample
			compatibility.push('* INCOMPATIBLE - '+info.name+': '+info.reason+';  ')
			writeExample('Markdown input', 'markdown', md)
			writeExample('Expected HTML', 'html', expected)
			//In this case, the example is not a test, since we don't add
			//tests for known incompatibilities.
		} else {
			it(name, () => {
				marmdown.textContent = md
				expect(withoutEmptyLines(html(marmdown))).toEqual(withoutEmptyLines(expected))
			})
		}
	}

	function withoutEmptyLines(text: string | null | undefined) {
		if(text == null) return ''

		return text
			.split('\n')
			.filter(s => s.length > 0)
			.join('\n')
	}

	function writeExample(label: string, format: string, content: string) {
		compatibility.push('  '+label+':')
		compatibility.push('  ```'+format)
		content.split('\n').forEach(l => compatibility.push('  '+l))
		compatibility.push('  ```')
	}

	function findTestsFrom(children: HTMLCollection) {
		for(let i=0; i<children.length; i++) {
			const child = children[i]
			
			if(child.nodeName === 'DIV' && child.classList.contains('appendices')) { return; }
	
			if(child.nodeName === 'H2') {
				const number = child.querySelector('span.number')?.textContent ?? ''
				let text = ''
				child.childNodes.forEach(cn => { if(cn.nodeName === '#text') { text = cn.textContent ?? '' } })
	
				if(implementedSections.filter(s => s.chapter===number).length > 0) {
					const sectionInfo = implementedSections.filter(s => s.chapter===number)[0]
	
					compatibility.push('## '+sectionInfo.chapter+' '+sectionInfo.name+' - Implemented')
					if(sectionInfo.notYetImplemented.length > 0 || sectionInfo.incompatible.length > 0) {
						compatibility.push('')
						compatibility.push('Except **not yet implemented** functionality and known **incompatibilities**:')
						compatibility.push('')
					}
	
					describe(number+': '+text, describeSection(children, i+1, sectionInfo))
				} else {
					compatibility.push('## '+number+' NOT yet Implemented')
					describe.skip(number+': '+text, describeSection(children, i+1))
				}
			} else if(child.nodeName === 'DIV' && child.classList.contains('extension')) {
				findTestsFrom(child.children)
			}
		}
	}
})
