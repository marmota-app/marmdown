import { MfMElement, MfMParser } from "../src/mfm/MfMParser"

export function parseMultiLine<T extends MfMElement>(parser: MfMParser<T>, lines: string[]): [T | null, string] {
	const text = lines.join('\n')
	const element = lines.reduce((previous: { result: T | null, start: number}, current) =>
		({ 
			result: parser.parseLine(previous.result, text, previous.start, current.length),
			start: previous.start + current.length + 1,
		})
		, { result: null, start: 0, }).result

	return [element, text]
}
