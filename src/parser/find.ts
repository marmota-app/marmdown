export function isEmpty(text: string, start: number, length: number) {
	const searchRegex = new RegExp(/[ \t]*/, 'y')
	searchRegex.lastIndex = start

	const findResult = searchRegex.exec(text)

	return findResult && findResult[0].length === length
}
