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
