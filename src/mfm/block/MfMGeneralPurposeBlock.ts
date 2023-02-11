import { Element, LineContent, ParsedLine, StringLineContent } from "$element/Element"
import { GenericBlock } from "$element/GenericElement"
import { BlockQuote } from "$element/MarkdownElements"
import { MfMBlockElements } from "$markdown/MfMDialect"
import { parseBlock } from "$parser/parse"
import { Parser } from "$parser/Parser"

export type MfMGeneralPurposeBlockContent = MfMBlockElements
export class MfMGeneralPurposeBlock extends GenericBlock<
	MfMGeneralPurposeBlock, MfMGeneralPurposeBlockContent, 'block-quote', MfMGeneralPurposeBlockParser
> implements BlockQuote<MfMGeneralPurposeBlock, MfMGeneralPurposeBlockContent> {
	continueWithNextLine: boolean = true
	constructor(id: string, pw: MfMGeneralPurposeBlockParser) { super(id, 'block-quote', pw) }
	override get isFullyParsed(): boolean {
		return !this.continueWithNextLine
	}
}

export class MfMGeneralPurposeBlockParser extends Parser<MfMGeneralPurposeBlock> {
	public readonly elementName = 'MfMGeneralPurposeBlock'

	parseLine(previous: MfMGeneralPurposeBlock | null, text: string, start: number, length: number): MfMGeneralPurposeBlock | null {
		if(text.charAt(start) === '>') {
			let i=1
			let lineStart = '>'
			const nextChar = text.charAt(start+1)
			if(nextChar === ' ' || nextChar === '\t') { 
				i++
				lineStart += nextChar
			}

			const block = previous ?? new MfMGeneralPurposeBlock(this.parsers.idGenerator.nextId(), this)
			block.lines.push(new ParsedLine(block))
			block.lines[block.lines.length-1].content.push(new StringLineContent(lineStart, start, i, block))

			const previousContent = block.content.length > 0? block.content[block.content.length-1] : null
			if(previous && previousContent && !previousContent.isFullyParsed) {
				const parsedWith = previousContent.parsedWith as Parser<typeof previousContent>
				const content = parsedWith.parseLine(previousContent, text, start+i, length-i)
				if(content) {
					const contentLine = content.lines[content.lines.length-1] as LineContent<Element<unknown, unknown, unknown, unknown>>
					previous.lines[previous.lines.length-1].content.push(contentLine)
					return block
				}
			}
		

			for(const contentParser of this.allBlocks) {
				const content = contentParser.parseLine(null, text, start+i, length-i) as MfMBlockElements
				if(content) {
					block.addContent(content)
					break
				}
			}

			return block
		}

		if(previous) {
			previous.continueWithNextLine = false
		}
		return null
	}

	private get allBlocks() { return this.parsers.allBlocks ?? [] }
}
