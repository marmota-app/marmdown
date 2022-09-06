/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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
import { TextContentParser } from "$markdown/paragraph/TextContentParser"

describe('TextContentParser', () => {
	it('parses given text completely', () => {
		const markdown = 'ignore me;this is the text;ignore me'
		const startIndex = 'ignore me;'.length
		const length = 'this is the text'.length

		const result = new TextContentParser().parse(markdown, startIndex, length)

		expect(result).toHaveProperty('startIndex', startIndex)
		expect(result).toHaveProperty('length', length)

		
		expect(result?.content).toHaveProperty('type', 'Text')
		expect(result?.content).toHaveProperty('content', 'this is the text')
		expect(result?.content).toHaveProperty('asText', 'this is the text')
		expect(result?.content).toHaveProperty('start', startIndex)
		expect(result?.content).toHaveProperty('length', length)
	})
})