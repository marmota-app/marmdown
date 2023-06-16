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

export function finiteLoop(variable: () => unknown) {
	let lastVariable: unknown | null = null
	return {
		guard: () => {
			let v = variable()
			if(v === lastVariable) { varUnchanged(lastVariable, v) }
			lastVariable = v
		}
	}
}

function varUnchanged(oldVar: unknown, v: unknown) {
	throw new Error(`Loop might be infinite - Variable did not change: [${oldVar}] === [${v}]`)
}
