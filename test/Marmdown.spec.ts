import { Marmdown } from "../src/Marmdown"

describe('Marmdown', () => {
	it('contains an empty document when freshly created', () => {
		const marmdown = new Marmdown()

		expect(marmdown.document).toHaveLength(0)
	})
})
