export type ContentChange = {
	readonly range: {
		readonly startLineNumber: number,
		readonly startColumn: number,
		readonly endLineNumber: number,
		readonly endColumn: number,
	} | undefined,
	readonly rangeOffset: number,
	readonly rangeLength: number,
	readonly text: string,
}
