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
					content-line
						text
				section 2
					heading 2
						content-line
							text
					section 3
						heading 3
							content-line
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
					content-line
						text
				section 2
					heading 2
						content-line
							text
			section 1
				heading 1
					content-line
						text
				section 3
					heading 3
						content-line
							text`)
	})

	test('block with paragraph content', () => {
		md.textContent = sanitized`
			some text
			more text
			
			# a heading
			next paragraph
			
			## a sub heading
			
			and another paragraph
			with two lines`

		expect(structure(md)).toEqual(sanitized`
			section 1
				paragraph
					content-line
						text
					content-line
						text
			section 1
				heading 1
					content-line
						text
				paragraph
					content-line
						text
				section 2
					heading 2
						content-line
							text
					paragraph
						content-line
							text
						content-line
							text`)
	})

	test('paragraph and block', () => {
		md.textContent = sanitized`
			some paragraph
			> a block
			another paragraph`

		expect(structure(md)).toEqual(sanitized`
			section 1
				paragraph
					content-line
						text
				block
					paragraph
						content-line
							text
				paragraph
					content-line
						text`)
	})

	test('block with content', () => {
		md.textContent = sanitized`
			> some text
			> more text
			>
			> # a heading
			> next paragraph`

		expect(structure(md)).toEqual(sanitized`
			section 1
				block
					paragraph
						content-line
							text
						content-line
							text
					section 1
						heading 1
							content-line
								text
						paragraph
							content-line
								text`)
	})
})