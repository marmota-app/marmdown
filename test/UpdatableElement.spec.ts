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
import { UpdatableElement } from "$markdown/UpdatableElement"

describe('UpdatableElement', () => {
	it('returns the given length', () => {
		const option = new UpdatableElement(0, 5)

		expect(option.length).toEqual(5)
	})
	it('returns the given start by default', () => {
		const option = new UpdatableElement(3, 0)

		expect(option.start).toEqual(3)
	})
	it('returns the parent start+length when there is a parent', () => {
		const option = new UpdatableElement(3, 0)
		option.parent = { text: '', start: 3, length: 4, parent: undefined, previous: undefined, }

		expect(option.start).toEqual(7)
	})
	it('returns the previous start+length when there is a previous', () => {
		const option = new UpdatableElement(3, 0)
		option.parent = { text: '', start: 3, length: 4, parent: undefined, previous: undefined, }
		option.previous = { text: '', start: 5, length: 6, parent: undefined, previous: undefined, }

		expect(option.start).toEqual(11)
	})
})