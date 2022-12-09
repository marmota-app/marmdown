/*
   Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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
import { ContainerInline, GenericLineContent, LeafInline, StringLineContent } from "../../src/element/Element"
import { compiles } from "./TypeTestUtil.tt"

describe('LineContent (can be either StringLineContent or GenericLineContent', () => {
	compiles('TYPE ERROR', () => {
		const dummy = new ContainerInline('dummy')
		const sl = new StringLineContent('a string', dummy)
		sl.content.push(new GenericLineContent(sl))
	}, 'A StringLineContent cannot have any content except the string itself.')

	compiles('OK', () => {
		const dummy = new ContainerInline('dummy')
		const gl = new GenericLineContent(dummy)
		gl.content.push(new StringLineContent('the text', dummy))
		gl.content.push(new GenericLineContent(dummy))
	}, 'GenericLineContent can contain string content or other generic content')	
})

describe('InlineContent (Element content that can be included in leaf blocks)', () => {
	compiles('OK', () => {
		const leaf = new LeafInline('dummy')
		leaf.lines.push(new StringLineContent('the text', leaf))
	}, 'A LeafInline can contain string line content')

	compiles('TYPE ERROR', () => {
		const leaf = new LeafInline('dummy')
		leaf.lines.push(new GenericLineContent(leaf))
	}, 'A LeafInline cannot contain other line content')
})
