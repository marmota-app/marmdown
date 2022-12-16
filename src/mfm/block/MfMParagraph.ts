import { GenericBlock } from "$element/GenericElement"
import { Paragraph } from "$element/MarkdownElements"
import { MfMText } from "$mfm/inline/MfMText"

export type MfMParagraphContent = MfMText
export class MfMParagraph extends GenericBlock<MfMParagraph, MfMParagraphContent, 'paragraph'> implements Paragraph<MfMParagraph, MfMParagraphContent> {
	constructor(id: string) { super(id, 'paragraph') }
}
