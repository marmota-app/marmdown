export interface FindResult {
	foundText: string,
	completeText: string,
	length: number,
}

export function find(text: string, toFind: string | RegExp, startIndex: number, maxLength: number, whenFound: (length: number, foundText: string) => unknown = ()=>{}): FindResult | null {
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
				completeText: (foundWhitespace?.[0] ?? '') + toFind,
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
				completeText: (foundWhitespace?.[0] ?? '') + findResult[0],
				length: whitespaceLength + findResult[0].length,
			}
		}
	}

	if(result) {
		whenFound(result.length, result.completeText)
	}
	return result
}

export function findOne(text: string, toFind: (string | RegExp)[], startIndex: number, maxLength: number, whenFound: (length: number, foundText: string) => unknown = ()=>{}): FindResult | null {
	for(var i=0; i<toFind.length; i++) {
		const result = find(text, toFind[i], startIndex, maxLength, whenFound)
		if(result) { return result }
	}
	return null
}

export function skipSpaces(text: string, startIndex: number, maxLength: number, whenFound: (length: number, foundText: string) => unknown = ()=>{}) {
	const whitespaceMatcher = /[ \t]+/y
	whitespaceMatcher.lastIndex = startIndex
	const foundWhitespace = whitespaceMatcher.exec(text)

	if(foundWhitespace) {
		whenFound(foundWhitespace[0].length, foundWhitespace[0])
	}
}
