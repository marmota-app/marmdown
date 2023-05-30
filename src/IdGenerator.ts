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

/**
 * An ID generator to create unique IDs for {@link Element}s of a document. 
 * 
 * IDs must be unique within the instance of the ID generator. This means
 * that calling `nextId()` must not return the same value as any of the
 * previous calls on the same `IdGenerator` instance.
 * 
 * Different `IdGenerator` instances can return the same ID. IOW, `IdGenertor`s
 * do not have to make sure that IDs are globally unique.
 */
export interface IdGenerator {
	/** The next unique ID. */
	nextId(): string,
	nextLineId(): string,
}

/**
 * An ID generator that returns a simple sequence of numbers formatted
 * with dashes (`0000-0000-0000-0042`).
 */
export class NumberedIdGenerator implements IdGenerator {
	private current = 0

	nextId() {
		const id = String(this.current)
			.padStart(16, '0')
			.split(/(....)/)
			.filter(s => s !== '')
			.join('-')

		this.current++
		return id
	}

	nextLineId(): string {
		return 'line-'+this.nextId()
	}
}