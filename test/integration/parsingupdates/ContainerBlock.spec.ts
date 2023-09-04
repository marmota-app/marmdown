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

import { Element } from "src/element/Element"
import { Marmdown } from "../../../src/Marmdown"
import { MfMDialect } from "../../../src/MfMDialect"
import { html } from "../html"
import { sanitized } from "../sanitize"

/* Updating container blocks is somewhat difficult. They don't derive their
 * content from their line content: Instead, they derive dynamic lines from
 * their content (options and "normal" content).
 * 
 * Because of that, we need to test updating container blocks thoroughly,
 * especially with multiple updates.
 */
describe('MfM: Parsing updates - Container Blocks', () => {
	const md = new Marmdown(new MfMDialect())

	test('adds line break to a paragraph inside an aside', () => {
		md.textContent = sanitized`^{ render-as=something; anchor=wherever; bamboozle=15; and-that=is the end; css-justify=left } Some aside\n^ that spans multiple lines`

		let childrenChangedOn = '-none-'
		const attachListeners = (e: Element<unknown, unknown, unknown, unknown>) => {
			e.content?.forEach((c: any, i) => {
				c.childrenChanged = () => childrenChangedOn = `${c.type}: ${i}`
				attachListeners(c)
			})
		}
		attachListeners(md.document!)

		md.update({ text: ' ', rangeOffset: '^{ render-as=something; anchor=wherever; bamboozle=15; and-that=is the end; css-justify=left } Some aside'.length, rangeLength: 0, }, () => 'dummy')
		md.update({ text: ' ', rangeOffset: '^{ render-as=something; anchor=wherever; bamboozle=15; and-that=is the end; css-justify=left } Some aside '.length, rangeLength: 0, }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<aside data-options="render-as=something;anchor=wherever;bamboozle=15;and-that=is the end;css-justify=left">\n<p>Some aside<br />\nthat spans multiple lines</p>\n</aside>`)
		expect(childrenChangedOn).toEqual('aside: 0')
	})

	test('parses multiple updates to options, adding an option', () => {
		md.textContent = sanitized`^{ k1=v1; k2=v2} The aside content.`

		md.update({ text: 'k3=v3', rangeOffset: '^{ k1=v1; '.length, rangeLength: 0, }, () => 'dummy')
		md.update({ text: ';', rangeOffset: '^{ k1=v1; k3=v3'.length, rangeLength: 0, }, () => 'dummy')

		expect(html(md)).toEqual(sanitized`
			<aside data-options="k1=v1;k3=v3;k2=v2">
			<p>The aside content.</p>
			</aside>`)
	})
})