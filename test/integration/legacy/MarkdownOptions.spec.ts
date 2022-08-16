import { ContentOptions, serializeOptions } from '$markdown/MarkdownOptions'

describe('Markdown Options', () => {
	describe('serializeOptions', () => {
		it('serializes empty options to "{}"', () => {
			const options: ContentOptions = {}

			const result = serializeOptions(options)

			expect(result).toEqual('{}')
		})

		it('serializes the default value as default', () => {
			const options: ContentOptions = {
				default: 'val1'
			}

			const result = serializeOptions(options)

			expect(result).toEqual('{val1}')
		})

		it('serializes all options', () => {
			const options: ContentOptions = {
				a: 'val_a',
				default: 'val1',
			}

			const result = serializeOptions(options)

			expect(result).toEqual('{val1;a=val_a}')
		})
	})
})