import { MfMElement, MfMParser } from "../src/mfm/MfMParser"

export function parseMultiLine<T extends MfMElement>(parser: MfMParser<T>, lines: string[]): [T | null, string] {
	const text = lines.join('\n')
	const element = lines.reduce((previous: { result: T | null, start: number}, current, index) => {
		const lookahead = (): [number, number] | null => {
			if(index < lines.length-1) {
				return [
					previous.start+current.length+1,
					lines[index+1].length
				]
			}
			return null
		}
		return { 
			result: (previous.start === 0 || previous.result != null)?
				parser.parseLine(previous.result, text, previous.start, current.length, { lookahead } )
				: null,
			start: previous.start + current.length + 1,
		}
	}
	
		, { result: null, start: 0, }).result

	return [element, text]
}
