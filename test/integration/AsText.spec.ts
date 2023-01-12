import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { html } from "./html"
import { sanitized } from "./sanitize"

describe('asText - Reproduce the original document', () => {
	const md = new Marmdown(new MfMDialect())

	test('a structure of different headings', () => {
		const text = sanitized`
			# foo
			## foo
			### foo
			#### foo
			##### foo
			###### foo`
		
		md.textContent = text

		expect(md.textContent).toEqual(text)
	})
})