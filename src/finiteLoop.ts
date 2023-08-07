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

export function INCREASING<T> (v: T, l: T|null) { return l==null || v > l }
export function CHANGING<T> (v: T, l: T|null) { return l==null || v !== l }

export function finiteLoop<T extends unknown | unknown[]>(
	variable: () => T,
	isValid: T extends unknown[]? ((v: T[number], l: T[number]|null)=>boolean)[] : (v: T, l: T|null)=>boolean
) {
	let lastVariable: T | null = null
	return {
		guard: () => {
			let v = variable()
			if(Array.isArray(v)) {
				if(!Array.isArray(isValid)) { throw new Error('isValid must be an array of validators!') }
				if(lastVariable != null && (!Array.isArray(lastVariable) || v.length !== lastVariable.length)) { throw new Error(`last variable ${lastVariable} must be null or an array and have the same length as current variable ${v}`) }

				v.forEach((cv, i) => {
					const lv = lastVariable != null? (lastVariable as any)[i] : null
					if(!isValid[i](cv, lv)) { varUnchanged(lv, cv) }
				})
				lastVariable = v
			} else {
				if(!isValid(v, lastVariable)) { varUnchanged(lastVariable, v) }
				lastVariable = v
			}
		}
	}
}

function varUnchanged(oldVar: unknown, v: unknown) {
	throw new Error(`Loop might be infinite - Variable did not change as expected: [${oldVar}] <===> [${v}]`)
}
