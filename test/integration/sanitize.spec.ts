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

import { sanitized } from "./sanitize"

describe('integration tests: sanitize', () => {
	test('no indentation', () => {
		expect(sanitized`foobar`).toEqual('foobar')
	})
	test('indented lines', () => {
		expect(sanitized`
				foo
				bar`).toEqual('foo\nbar')
	})
	test('mixed indentation', () => {
		expect(sanitized`
				      foo
				bar`).toEqual('      foo\nbar')
	})
	test('indented lines: different indentation', () => {
		expect(sanitized`
				foo
					bar`).toEqual('foo\n\tbar')
	})

	test('parameters', () => {
		const val = 'bar'
		expect(sanitized`
			foo${val}baz`).toEqual('foobarbaz')
	})
	test('parameters (at end)', () => {
		const val1 = 'bar'
		const val2 = 'foo'
		expect(sanitized`
			foo${val1}baz${val2}`).toEqual('foobarbazfoo')
	})
})
