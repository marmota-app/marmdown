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

const __escaping__ = 'Escaping is not yet implemented'
const __emphasis__ = 'Emphasis is not yet implemented'
const __fenced__ = 'Fenced code blocks are not yet implemented'
const __paragraph_leading__ = 'Leading spaces are not yet removed correctly for paragraphs'

const implementedSections: ImplementedSection[] = [
	{ chapter: '1.1', name: 'What is GitHub Flavored Markdown?', notYetImplemented: [], incompatible: []},
	{ chapter: '1.2', name: 'What is Markdown?', notYetImplemented: [], incompatible: []},
	{ chapter: '1.3', name: 'Why is a spec needed?', notYetImplemented: [], incompatible: []},
	{ chapter: '1.4', name: 'About this document', notYetImplemented: [], incompatible: []},
	{ chapter: '2.1', name: 'Characters and lines', notYetImplemented: [], incompatible: []},
	{ 
		chapter: '4.2', name: 'ATX headings',
		notYetImplemented: [
			{ name: 'Example 35', reason: __escaping__ },
			{ name: 'Example 36', reason: __emphasis__+', '+__escaping__ },
			{ name: 'Example 37', reason: 'Leading & trailing whitespace for headings is not yet removed' },
			{ name: 'Example 38', reason: 'Indentation for headings is not yet supported' },
			{ name: 'Example 39', reason: __fenced__ },
			{ name: 'Example 40', reason: __paragraph_leading__ },
			{ name: 'Example 41', reason: 'Optional closing sequences are not yet supported' },
			{ name: 'Example 42', reason: 'Optional closing sequences are not yet supported' },
			{ name: 'Example 43', reason: 'Optional closing sequences are not yet supported' },
			{ name: 'Example 46', reason: __escaping__ },
			{ name: 'Example 49', reason: 'Optional closing sequences are not yet supported' },
		],
		incompatible: [],
	},
]

const compatibility: string[] = []
describe('Github-flavored-Markdown (GfM) compatibility', () => {
	const marmdown = new Marmdown(new MfMDialect())

	const gfmSpecContent = fs.readFileSync('test/integration/gfm/GitHub Flavored Markdown Spec.html', 'utf-8')
	const gfmSpec = new JSDOM(gfmSpecContent)
	
	const children = gfmSpec.window.document.body.children

	compatibility.push('# Markdown compatibility')
	compatibility.push('')

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
				if(sectionInfo.notYetImplemented.length > 0) {
					compatibility.push('')
					compatibility.push('Except **not yet implemented** functionality:')
					compatibility.push('')
					sectionInfo.notYetImplemented.forEach(nyi => compatibility.push('* '+nyi.name+': '+nyi.reason))
				}

				if(sectionInfo.incompatible.length > 0) {
					compatibility.push('')
					compatibility.push('Known **incompatibilities**:')
					compatibility.push('')
					sectionInfo.incompatible.forEach(nyi => compatibility.push('* '+nyi.name+': '+nyi.reason))
				}
				describe(number+': '+text, describeSection(children, i+1, sectionInfo))
			} else {
				compatibility.push('## '+number+' NOT yet Implemented')
				describe.skip(number+': '+text, describeSection(children, i+1))
			}
		}

		if(process.env.WRITE_COMPAT_INFO) {
			fs.writeFileSync('./docs/github-flavored-markdown-compatibility.md', compatibility.join('\n'))
		}
	}

	function describeSection(children: HTMLCollection, startIndex: number, sectionInfo?: ImplementedSection) {
		return () => {
			for(let i=startIndex; i < children.length; i++) {
				const child = children[i]
	
				if(child.nodeName === 'H1' || child.nodeName === 'H2') { return }
	
				if(child.nodeName === 'DIV' && child.classList.contains('example')) {
					const example = withoutEmptyLines(child.querySelector('.examplenum')?.textContent)
					const md = child.querySelector('.language-markdown')?.textContent
					const html = child.querySelector('.language-html')?.textContent
	
					if(example != null && md != null && html != null) {
						testExample(example, md, html, sectionInfo)
					}
				}
			}
		}
	}
	
	function testExample(name: string, md: string, expected: string, sectionInfo?: ImplementedSection) {
		if(sectionInfo?.notYetImplemented.filter(nyi => nyi.name === name)?.length??0 > 0) {
			it.skip(name+'(-- '+sectionInfo?.notYetImplemented?.filter(nyi => nyi.name === name)[0].reason+' --)', () => {
				marmdown.textContent = md
				expect(withoutEmptyLines(html(marmdown))).toEqual(withoutEmptyLines(expected))
			})
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
})
