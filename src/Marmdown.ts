import { ContainerBlock } from "$element/Element"
import { MarmdownParsers, Parsers } from "./MarmdownParsers"

export class Marmdown {
	private _document: ContainerBlock[] = []

	constructor(private readonly parsers: Parsers = new MarmdownParsers()) {}

	set textContent(text: string) {
		this._document = this.parsers.parseCompleteText(text)
	}

	get document(): ContainerBlock[] {
		return this._document
	}
}
