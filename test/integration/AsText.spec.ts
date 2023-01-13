import { Marmdown } from "$markdown/Marmdown"
import { MfMDialect } from "$markdown/MfMDialect"
import { sanitized } from "./sanitize"

describe('asText - Reproduce the original document', () => {
	md('a structure of different headings')
		.canReproduce(sanitized`
			# foo
			## foo
			### foo
			#### foo
			##### foo
			###### foo`)
	
	skip('text content with "empty" section at the start and another section')
		.canReproduce(sanitized`
			some paragraph content
			with two lines
			
			# The next section
			
			with more paragraph content`)
})

function md(title: string) {
	return {
		canReproduce: (text: string) => {
			test(title, () => {
				const md = new Marmdown(new MfMDialect())
				md.textContent = text

				expect(md.textContent).toEqual(text)
			})
		}
	}
}
function skip(title: string) {
	return {
		canReproduce: (text: string) => {
			test.skip(title, () => {})
		}
	}
}
