import { Marmdown } from "$markdown/Marmdown";
import { MfMDialect } from "$markdown/MfMDialect";
import { MfMContainer } from "$mfm/MfMContainer";

export function parseMarkdown(text: string) {
	const md = new Marmdown(new MfMDialect())

	md.textContent = text

	return toLegacy(md)
}

function toLegacy(md: Marmdown<MfMContainer>) {
	return md.document!
}