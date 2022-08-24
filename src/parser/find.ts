export interface FindResult {
	foundText: string,
	length: number,
}

export function find(text: string, toFind: string | RegExp, startIndex: number, maxLength: number, whenFound: (length: number) => unknown = ()=>{}): FindResult | null {
	let result = null

	const whitespaceMatcher = /[ \t]+/y
	whitespaceMatcher.lastIndex = startIndex
	const foundWhitespace = whitespaceMatcher.exec(text)
	let whitespaceLength = 0

	if(foundWhitespace) {
		startIndex += foundWhitespace[0].length
		whitespaceLength = foundWhitespace[0].length
	}

	if(typeof toFind === 'string') {
		if(text.indexOf(toFind, startIndex) === startIndex) {
			result = {
				foundText: toFind,
				length: whitespaceLength + toFind.length,
			}
		}
	} else {
		const searchRegex = new RegExp(toFind, 'y')
		searchRegex.lastIndex = startIndex
		const findResult = searchRegex.exec(text)

		if(findResult) {
			result = {
				foundText: findResult[0],
				length: whitespaceLength + findResult[0].length,
			}
		}
	}

	if(result)  {
		whenFound(result.length)
	}
	return result
}