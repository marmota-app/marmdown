import { StringLineContent } from "$element/Element";
import { GenericInline } from "$element/GenericElement";
import { Text } from "$element/MarkdownElements";

export class MfMText extends GenericInline<MfMText, never, StringLineContent<MfMText>, 'text'> implements Text<MfMText> {
	constructor(id: string) { super(id, 'text') }
}
