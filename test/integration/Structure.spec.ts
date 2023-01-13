import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { structure } from "./structure"
import { sanitized } from "./sanitize"

describe('Document Structure', () => {
	const md = new Marmdown(new MfMDialect())

	test('Simple headings (https://github.github.com/gfm/#example-32)', () => {
		md.textContent = sanitized`
			# foo
			## foo
			### foo`

		expect(structure(md)).toEqual(sanitized`
			section 1
				heading 1
					heading-text
						text
				section 2
					heading 2
						heading-text
							text
					section 3
						heading 3
							heading-text
								text`)
	})
	test('Simple headings (https://github.github.com/gfm/#example-32)', () => {
		md.textContent = sanitized`
			# foo
			## foo
			# foo
			### foo`

		expect(structure(md)).toEqual(sanitized`
			section 1
				heading 1
					heading-text
						text
				section 2
					heading 2
						heading-text
							text
			section 1
				heading 1
					heading-text
						text
				section 3
					heading 3
						heading-text
							text`)
	})

})