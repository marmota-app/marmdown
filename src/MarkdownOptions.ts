export interface Option {
	key: string,
	value: string,
}
export type ContentOptions = {
	[key: string]: string,
}
export interface Options {
	options: Option[],
	asMap: ContentOptions,
}

export function serializeOptions(options: ContentOptions): string {
	let result = '{'

	if(options.default) {
		result += options.default
	}

	Object.keys(options).forEach(key => {
		if(key !== 'default') {
			if(result.length > 1) {
				result += ';'
			}
			result += key+'='+options[key]
		}
	})

	result += '}'
	return result
}
