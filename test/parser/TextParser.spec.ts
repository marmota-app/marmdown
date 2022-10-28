import { ContainerTextParser, TextParser } from "$markdown/parser/TextParser";
import { ParsedDocumentContent, Updatable } from "$markdown/Updatable";
import { UpdatableElement } from "$markdown/UpdatableElement";

describe('TextParser', () => {
	describe('partial parsing of leaf element', () => {
		interface Leaf extends Updatable<Leaf, unknown> {}
		class UpdatableLeaf extends UpdatableElement<Leaf, unknown> {
			constructor(public readonly text: string, contents: ParsedDocumentContent<Leaf, unknown>[], parsedWith?: TextParser<unknown, Updatable<Leaf, unknown>>) {
				super(contents, parsedWith)
			}
		}
		
		class TestLeafTextParser extends ContainerTextParser<unknown, Leaf> {
			parse(previous: Leaf | null, text: string, start: number, length: number): Leaf | null {
				//Allow for **not** fully parsing by adding a special character where parsing stops:
				const parsedText = text.indexOf('#')>0? text.substring(0, text.indexOf('#')) : text

				//A leaf element has no other contained elements. The parser should only consider start,
				//length and asText when partially parsing this element.
				return new UpdatableLeaf(parsedText, [{ asText: parsedText, length: parsedText.length, start: start, contained: []}], this)
			}
		}
		const parser = new TestLeafTextParser()
		const dummyParentElement = parser.parse(null, 'dummy parent element', 6, 6)

		it('updates the element based on added content when it\'s inside the element\'s range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: ' ', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('start', 6)
			expect(updated?.contents[0]).toHaveProperty('length', 7)
			expect(updated?.contents[0]).toHaveProperty('asText', 'foo bar')
		})
		it('updates the element based on removed content when it\'s inside the element\'s range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 3, text: '', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('start', 6)
			expect(updated?.contents[0]).toHaveProperty('length', 3)
			expect(updated?.contents[0]).toHaveProperty('asText', 'foo')
		})
		it('updates the element based on changed content when it\'s inside the element\'s range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 3, text: 'foo', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('start', 6)
			expect(updated?.contents[0]).toHaveProperty('length', 6)
			expect(updated?.contents[0]).toHaveProperty('asText', 'foofoo')
		})
		it('creates an updated element with the new parse result when updating', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: ' ', range: undefined })

			expect(updated).toHaveProperty('text', 'foo bar')
		})
		it('preserves the parent element when updating', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)
			leaf!.contents[0].parent = dummyParentElement!.contents[0]

			const updated = parser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: ' ', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('parent', dummyParentElement?.contents[0])
		})

		it('does not update the element when the change starts before the start the range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 5, rangeLength: 5, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when the change starts after the end the range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 50, rangeLength: 5, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when the change ends before the start the range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 7, rangeLength: -2, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when the change ends after the end the range', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 7, rangeLength: 50, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})

		it('does not update the element when the change was not fully parsed', () => {
			const leaf = parser.parse(null, 'foobar', 6, 6)

			const updated = parser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: '#', range: undefined })

			expect(updated).toBeNull()
		})
	})
})