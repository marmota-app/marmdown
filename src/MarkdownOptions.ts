export interface Option {
	key: string,
	value: string,
}
export type ContentOptions = {
	[key: string]: string,
}
export interface Options {
	readonly options: Option[],
	readonly asMap: ContentOptions,
}

export const DEFAULT_OPTIONS: Options = {
	options: [],
	asMap: {},
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
