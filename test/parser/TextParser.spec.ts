import { ContainerTextParser, TextParser } from "$markdown/parser/TextParser";
import { ParsedDocumentContent, StringContent, Updatable } from "$markdown/Updatable";
import { UpdatableElement } from "$markdown/UpdatableElement";

describe('TextParser', () => {
	interface Leaf extends Updatable<Leaf, unknown, LeafContent> {
		text: string,
	}
	class LeafContent extends ParsedDocumentContent<Leaf, unknown> {
		constructor(public text: string, start: number, length: number, belongsTo: Updatable<Leaf, unknown, ParsedDocumentContent<unknown, unknown>>) {
			super(start, length, belongsTo)
		}
		get asText() {
			return this.text
		}
	}
	class UpdatableLeaf extends UpdatableElement<Leaf, unknown, LeafContent> {
		constructor(contents: LeafContent[], parsedWith?: TextParser<unknown, Updatable<Leaf, unknown, LeafContent>, LeafContent>) {
			super(parsedWith)
		}

		get text() { return this.contents[0].text }

		get isFullyParsed(): boolean {
			return true
		}
	}

	class TestLeafTextParser extends ContainerTextParser<unknown, Leaf, LeafContent> {
		override parse(previous: Leaf | null, text: string, start: number, length: number): [ Leaf | null, LeafContent | null, ] {
			//Allow for **not** fully parsing by adding a special character where parsing stops:
			const parsedText = text.indexOf('#', start)>0? text.substring(start, text.indexOf('#', start)) : text.substring(start)

			//A leaf element has no other contained elements. The parser should only consider start,
			//length and asText when partially parsing this element.
			const leaf = new UpdatableLeaf([], this)
			const content = new LeafContent(parsedText, start, parsedText.length, leaf)
			leaf.contents.push(content)

			return [ leaf, content]
		}
	}
	const leafParser = new TestLeafTextParser()
	const [ dummyParentElement, ] = leafParser.parse(null, 'dummy parent element', 6, 6)

	describe('partial parsing of leaf element', () => {
		it('updates the element based on added content when it\'s inside the element\'s range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: ' ', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('start', 6)
			expect(updated?.contents[0]).toHaveProperty('length', 7)
			expect(updated?.contents[0]).toHaveProperty('asText', 'foo bar')
		})
		it('updates the element based on removed content when it\'s inside the element\'s range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 3, text: '', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('start', 6)
			expect(updated?.contents[0]).toHaveProperty('length', 3)
			expect(updated?.contents[0]).toHaveProperty('asText', 'foo')
		})
		it('updates the element based on changed content when it\'s inside the element\'s range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 3, text: 'foo', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('start', 6)
			expect(updated?.contents[0]).toHaveProperty('length', 6)
			expect(updated?.contents[0]).toHaveProperty('asText', 'foofoo')
		})
		it('creates an updated element with the new parse result when updating', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: ' ', range: undefined })

			expect(updated).toHaveProperty('text', 'foo bar')
		})
		it('preserves the parent element when updating', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)
			leaf!.contents[0].parent = dummyParentElement!.contents[0]

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: ' ', range: undefined })

			expect(updated?.contents[0]).toHaveProperty('parent', dummyParentElement?.contents[0])
		})

		it('does not update the element when the change starts before the start the range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 5, rangeLength: 5, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when the change starts after the end the range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 50, rangeLength: 5, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when the change ends before the start the range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 7, rangeLength: -2, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when the change ends after the end the range', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 7, rangeLength: 50, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})

		it('does not update the element when the change was not fully parsed', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 9, rangeLength: 0, text: '#', range: undefined })

			expect(updated).toBeNull()
		})
		it('does not update the element when it has a start index < 0', () => {
			const [ leaf, ] = leafParser.parse(null, '12345#foobar', 6, 6)
			leaf!.contents[0].start = -1

			const [ updated, ] = leafParser.parsePartial(leaf!, { rangeOffset: 2, rangeLength: 0, text: ' ', range: undefined })

			expect(updated).toBeNull()
		})
	})

	describe('partial parsing of container element', () => {
		interface Container extends Updatable<Container, string | Leaf, ContainerContent> {
		}
		class ContainerContent extends ParsedDocumentContent<Container, string | Leaf> {
			constructor(public leaves: Leaf[], start: number, length: number, belongsTo: UpdatableContainer, contained: ParsedDocumentContent<unknown, string | Leaf>[]) {
				super(start, length, belongsTo, contained)
			}
		}
		class UpdatableContainer extends UpdatableElement<Container, string | Leaf, ContainerContent> {
			constructor(contents: ContainerContent[], parsedWith?: TextParser<string | Leaf, Updatable<Container, string | Leaf, ContainerContent>, ContainerContent>) {
				super(parsedWith)
			}
			get isFullyParsed(): boolean {
				return true
			}
		}

		class TestContainerTextParser extends ContainerTextParser<string | Leaf, Container, ContainerContent> {
			override parse(previous: Container | null, text: string, start: number, length: number): [ Container | null, ContainerContent | null, ] {
				const leaves: Leaf[] = []
				const contained: (LeafContent | StringContent<UpdatableContainer>)[] = []
				const container = new UpdatableContainer([], this)

				let lastIndex = start;
				let nextIndex = text.indexOf('#', lastIndex)

				while(nextIndex > 0) {
					const [ leaf, content, ] = leafParser.parse(null, text, lastIndex, nextIndex-lastIndex)
					contained.push(content!)
					leaves.push(leaf!)
					contained.push(new StringContent('#', nextIndex, 1, container))
					lastIndex = nextIndex+1
					nextIndex = text.indexOf('#', lastIndex)
				}
				if(lastIndex < length-1) {
					const [ leaf, content, ] = leafParser.parse(null, text, lastIndex, nextIndex-lastIndex)
					contained.push(content!)
					leaves.push(leaf!)
				}
				const ownContent = new ContainerContent(leaves, start, length, container, contained)
				container.contents.push(ownContent)
				return [ container, ownContent, ]
			}
		}
		const containerParser = new TestContainerTextParser()
	
		function expectContent(result: Container | null | undefined, ...contents: string[]) {
			contents.forEach((c, i) => {
				expect(result?.contents[0].leaves[i]).toHaveProperty('text', c)
				expect(result?.contents[0].contained[2*i]).toHaveProperty('asText', c)
			})
		}
		it('parses container with three leaves', () => {
			const text = 'one#two#three'
			const [ result, ] = containerParser.parse(null, text, 0, text.length)

			expect(result?.contents[0].leaves).toHaveLength(3)
			expect(result?.contents[0].contained).toHaveLength(5)

			expectContent(result, 'one', 'two', 'three')

			expect(result?.contents[0]).toHaveProperty('asText', text)
		})
		it('updates the affected leaf when a change is inside a leaf (first)', () => {
			const text = 'one#two#three'
			const [ container, ] = containerParser.parse(null, text, 0, text.length)
			const [ result, ] = container!.parsedWith!.parsePartial(container!, { rangeOffset: 3, rangeLength: 0, text: 'one', range: undefined, })

			expectContent(result, 'oneone', 'two', 'three')
		})
		it('updates only the affected leaf when a change is inside a leaf (third)', () => {
			const text = 'one#two#three'
			const [ container, ] = containerParser.parse(null, text, 0, text.length)
			const [ result, ] = container!.parsedWith!.parsePartial(container!, { rangeOffset: 8, rangeLength: 2, text: '--', range: undefined, })

			expectContent(result, 'one', 'two', '--ree')
		})
		it('Adds another leaf when inserting a # character', () => {
			const text = 'one#two#three'
			const [ container, ] = containerParser.parse(null, text, 0, text.length)
			const [ result, ] = container!.parsedWith!.parsePartial(container!, { rangeOffset: 10, rangeLength: 0, text: '#', range: undefined, })

			expectContent(result, 'one', 'two', 'th', 'ree')
		})
		it('Removes a leaf when removing a # character', () => {
			const text = 'one#two#three'
			const [ container, ] = containerParser.parse(null, text, 0, text.length)
			const [ result, ] = container!.parsedWith!.parsePartial(container!, { rangeOffset: 7, rangeLength: 1, text: ':', range: undefined, })

			expectContent(result, 'one', 'two:three')
		})
	})
})