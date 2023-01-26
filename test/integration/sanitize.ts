export function sanitized(markdown: TemplateStringsArray) {
	let result = markdown.at(0)
	if(!result) {
		return ''
	}

	if(result.startsWith('\n')) {
		result = result.substring(1)
	}

	const indentation = /^[\t]+/.exec(result)
	if(indentation) {
		const remove = new RegExp(`^${indentation[0]}`, 'gm')
		result = result.replaceAll(remove, '')
	}

	return result
}
