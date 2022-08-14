export type ContentChange = {
	readonly range: {
		readonly startLineNumber: number,
		readonly startColumn: number,
		readonly endLineNumber: number,
		readonly endColumn: number,
	},
	readonly rangeOffset: number,
	readonly rangeLength: number,
	readonly text: string,
}
