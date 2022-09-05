import { ContainerTextParser, ParserResult, TextParser } from "$markdown/parser/TextParser"
import { UpdatableParagraphContent } from "$markdown/toplevel/ParagraphParser"
import { UpdatableContainerElement } from "$markdown/UpdatableElement"
import { NewlineContentParser } from "./NewlineParser"
import { TextContentParser, UpdatableTextContent } from "./TextContentParser"

export class UpdatableLineContent extends UpdatableContainerElement<UpdatableLineContent, UpdatableParagraphContent> {
	constructor(parts: UpdatableParagraphContent[], _start: number, parsedWith: LineContentParser) {
		super(parts, _start, parsedWith)
	}

	get hasChanged() { return false }
	get content() { return this.parts }
}

const NEW_LINE_CHARS = [ '\r', '\n', '\r\n' ]

export class LineContentParser extends ContainerTextParser<UpdatableLineContent, UpdatableParagraphContent> implements TextParser<UpdatableLineContent> {
	constructor(private textParser = new TextContentParser, private newlineParser = new NewlineContentParser()) {
		super()
	}

	parse(text: string, start: number, length: number): ParserResult<UpdatableLineContent> | null {
		const parts: UpdatableParagraphContent[] = []
		let i = 0
		const incrementIndex = (l: number) => i+=l

		const newLineIndex = NEW_LINE_CHARS
			.map(c => text.indexOf(c, i+start))
			.filter(i => i>=0)
			.reduce((p: number | null, c)=>p? Math.min(p,c) : c, null)

		const textContent = newLineIndex? 
			this.textParser.parse(text, start, newLineIndex-start) :
			this.textParser.parse(text, start, length)
		
		if(textContent) {
			i += textContent.length
			parts.push(textContent.content)
		}

		if(newLineIndex) {
			const newlineContent = this.newlineParser.parse(text, start+i, length-i)
			if(newlineContent) {
				i += newlineContent.length
				parts.push(newlineContent.content)
			}
		}

		return {
			startIndex: start,
			length: i,
			content: new UpdatableLineContent(parts, start, this),
		}
	}
}
