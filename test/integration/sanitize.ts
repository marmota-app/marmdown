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

export function sanitized(markdown: TemplateStringsArray, ...params: string[]) {
	let result = markdown
		.map((t, i) => i<params.length? t+params[i] : t)
		.join('')
	
	if(!result) {
		return ''
	}

	if(result.startsWith('\n')) {
		result = result.substring(1)
	}

	const indentation = /^[\t]+/.exec(result)
	if(indentation) {
		const remove = new RegExp(`^${indentation[0]}`, 'gm')
		result = result.replaceAll(remove, '')
	}

	return result
}
