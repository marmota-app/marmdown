import { ContentChange } from "./ContentChange"
import { ALL_LEVELS, Arrow, Block, BoldTextContent, DefaultContent, ItalicTextContent, List, ListItem, MarkdownDocument, Paragraph, ParagraphContent, ParseResult, StrikeThroughTextContent, Table, TableCell, TableColumn, TextContent } from "./MarkdownDocument"
import { ContentOptions } from "./MarkdownOptions"
import { postprocessHeadingOptions, postprocessHorizontalRuleOptions } from "./optionsPostprocessors"

export function parseMarkdown(markdown: string, changes: ContentChange[] = []): MarkdownDocument {
	const document = new MarkdownDocument

	if(markdown.length > 0) {
		const lines = markdown.replaceAll('\r', '').split('\n')
		const hasLineChanged = (line: number) => changes.length > 0 && changes[0].range.startLineNumber === (line + 1)

		parseDocumentOptions(lines, document)
		for(let i = 0; i < lines.length; i++) {
			parseLine(lines, i, document, hasLineChanged(i))
		}
	}
	return document
}

function parseDocumentOptions(lines: string[], document: MarkdownDocument) {
	if(lines[0].startsWith('{')) {
		lines[0] = parseMarkdownElementOptions(lines[0], document.options)
	}
}

function parseLine(lines: string[], index: number,  document: ParseResult, hasChanged: boolean): void {
	if(parseHeading(lines[index], document, hasChanged, index)) {
		return
	}
	if(parseUnorderedList(lines, index, document, hasChanged)) {
		return
	}
	if(parseOrderedList(lines, index, document, hasChanged)) {
		return
	}
	if(parseTable(lines, index, document, hasChanged)) {
		return
	}
	if(parseAside(lines[index], document, hasChanged)) {
		return
	}
	if(parseBlockquote(lines[index], document, hasChanged)) {
		return
	}
	if(parsePreformattedBlock(lines[index], document, hasChanged)) {
		return
	}
	if(parseHorizontalRule(lines[index], document, hasChanged, index)) {
		return
	}
	if(parseParagraph(lines[index], document, hasChanged)) {
		return
	}
}

function parseHeading(line: string, document: ParseResult, hasChanged: boolean, lineNumber: number): boolean {
	let headingToken = ''
	for(const i of ALL_LEVELS) {
		headingToken = '#' + headingToken
		if(line === headingToken) {
			line = headingToken + ' '
		}
		if(line.startsWith(headingToken + ' ')) {
			const text = line.replace(headingToken + ' ', '')
			const options: ContentOptions = {
				optionsLine: ''+lineNumber,
				optionsStart: ''+headingToken.length,
				optionsLength: '0',
			}
			postprocessHeadingOptions(options, i)
			document.content.push({ type: 'Heading', level: i, text, hasChanged, options, })
			return true
		} else if(line.startsWith(headingToken+'{')) {
			const options: ContentOptions = {}
			const text = parseMarkdownElementOptions(line.substring(headingToken.length), options)
			postprocessHeadingOptions(options, i)
			options.optionsStart = ''+headingToken.length
			options.optionsLine = ''+lineNumber
			options.optionsLength = ''+(line.length - text.length - headingToken.length)

			document.content.push({ type: 'Heading', level: i, text: text.trim(), hasChanged, options, })
			return true
	
		}
	}
	return false
}

function parseOrderedList(lines: string[], index: number, document: ParseResult, hasChanged: boolean): boolean {
	return parseList([/^\d+\./], 'OrderedList', lines, index, document, hasChanged)
}

function parseList(tokens: RegExp[], type: 'OrderedList' | 'UnorderedList', lines: string[], index: number, document: ParseResult, hasChanged: boolean): boolean {
	const line = lines[index]
	const previousLine = index > 0 ? lines[index - 1] : 'unknown'

	const currentContent = document.content[document.content.length - 1] || { type: 'none', }
	const matchedLeadingSpaces = line.match(/^[ \t]+/)
	if(matchedLeadingSpaces && currentContent.type === type) {
		const numSpaces = matchedLeadingSpaces[0].length
		let currentList: List = currentContent as List
		if(numSpaces > currentList.indentLevel) {
			let parsedContent = currentList.items[currentList.items.length-1].content
			let lastParsed = parsedContent[parsedContent.length-1]
			while((lastParsed.type==='OrderedList' || lastParsed.type==='UnorderedList') && lastParsed.indentLevel < numSpaces) {
				currentList = lastParsed
				parsedContent = currentList.items[currentList.items.length-1].content
				lastParsed = parsedContent[parsedContent.length-1]
				}
		}

		if(currentList.items.length > 0) {
			parseLine([ line.substring(numSpaces) ], 0, currentList.items[currentList.items.length-1], hasChanged)
			
			const parsedContent = currentList.items[currentList.items.length-1].content
			const lastParsed = parsedContent[parsedContent.length-1]
			if((lastParsed.type==='OrderedList' || lastParsed.type==='UnorderedList') && lastParsed.indentLevel <= currentList.indentLevel) {
				(lastParsed as List).indentLevel = numSpaces
			}
			return true
		}
	}
	
	for(const token of tokens) {
		if(line.match(token)) {
			let listItemLine = line.replace(token, '')
			if(listItemLine.startsWith(' ') || listItemLine.startsWith('{')) {
				const options: ContentOptions = {}
				if(listItemLine.startsWith('{')) {
					listItemLine = parseMarkdownElementOptions(listItemLine, options)
				} else {
					listItemLine = listItemLine.substring(1)
				}

				const lineContent: ParagraphContent[] = []
				parseParagraphLine(listItemLine, lineContent)
				const item: ListItem = {
					type: 'ListItem',
					content: [{ type: 'Paragraph', content: lineContent, hasChanged: hasChanged, }],
					options,
				}
	
				if(currentContent.type === type && previousLine.trim().length != 0) {
					currentContent.items.push(item)
				} else {
					document.content.push({ type: type, indentLevel: 0, items: [ item, ], hasChanged, options})
				}
				return true	
			}
		}
	}
	return false
}

function parseUnorderedList(lines: string[], index: number, document: ParseResult, hasChanged: boolean): boolean {
	return parseList([/^\*/, /^-/, /^\+/], 'UnorderedList', lines, index, document, hasChanged)
}

function parseTable(lines: string[], index: number, document: ParseResult, hasChanged: boolean): boolean {
	const line = lines[index]

	if(line.startsWith('|')) {
		const currentContent = document.content[document.content.length - 1] || { type: 'none', }

		if(currentContent.type !== 'Table') {
			const options: ContentOptions = {}
			const texts = line.split('|')
				.map(h => h.trim())
				.filter(h => h.length > 0)
			
			if(texts.length > 0 && texts[texts.length-1].match(/^\{.*\}$/)) {
				parseMarkdownElementOptions(texts[texts.length-1], options)
				texts.pop()
			}
			if(line.match(/^(\|[ \t]*:?-+:?[ \t]*)+\|?$/)) {
				document.content.push({ type: 'Table', columns: parseTableDelimiterLine(texts), headings: [], rows: [], hasChanged, options})
			} else {
				if(index+1 >= lines.length) {
					//Not a table: Cannot have a delimiter line
					return false
				} else {
					const nextLine = lines[index+1]
					if(!nextLine.match(/^(\|[ \t]*:?-+:?[ \t]*)+\|?$/)) {
						return false
					}
				}
				const headings = texts
					.map(h => {
						const paragraphContent: ParagraphContent[] = []
						parseParagraphLine(h, paragraphContent)
	
						return { type: 'TableCell', content: paragraphContent, } as TableCell
					})
				document.content.push({ type: 'Table', headings: headings, rows: [], hasChanged, options})
			}
			return true
		} else {
			if(currentContent.columns != null) {
				let content = line.split('|')
					.map(c => c.trim())
					.filter((c, i, array) => i > 0 && (i < array.length-1 || c.length > 0))
					.map(h => {
						if(h.length === 0) {
							return { type: 'TableCell', content: [{ type: 'Text', content: ''}], } as TableCell
						}
						const paragraphContent: ParagraphContent[] = []
						parseParagraphLine(h, paragraphContent)

						return { type: 'TableCell', content: paragraphContent, } as TableCell
					})
				
				const cols = currentContent.columns
				while(content.length < currentContent.columns.length) {
					content.push({ type: 'TableCell', content: [{ type: 'Text', content: ''}]})
				}
				if(content.length > cols.length) {
					content = content.filter((_, i) => i < cols.length)
				}
				currentContent.rows.push({ type: 'TableRow', columns: content, })
				return true
			} else {
				const texts = line.split('|')
					.map(h => h.trim())
					.filter(h => h.length > 0)

				currentContent.columns = parseTableDelimiterLine(texts, currentContent)
				return true
			}
		}
	}
	return false
}
function parseTableDelimiterLine(texts: string[], currentContent?: Table): TableColumn[] {
	const columns: TableColumn[] = texts.map(text => {
		if(text.match(/^:-+:$/)) {
			return { align: 'center', }
		} else if(text.match(/^-+:$/)) {
			return { align: 'right', }
		}
		return { align: 'left', }
	})

	if(currentContent && currentContent.headings) {
		while(currentContent.headings.length < columns.length) {
			currentContent.headings.push({ type: 'TableCell', content: [{ type: 'Text', content: ''}]})
		}
		if(currentContent.headings.length > columns.length) {
			currentContent.headings = currentContent.headings.filter((_, i) => i < columns.length)
		}
	}

	return columns
}

function parseAside(line: string, document: ParseResult, hasChanged: boolean) {
	const token = '^'

	if(line === token) {
		line = `${token} `
	}

	if(line.startsWith(`${token} `) || line.startsWith(`${token}{`)) {
		const currentContent = document.content[document.content.length - 1] || { type: 'none', }
		let aside: Block = { type: 'Aside', content: [ ], options: { }, }
		if(currentContent.type === 'Aside') {
			aside = currentContent
		} else {
			document.content.push({ ...aside, hasChanged, })
		}
		let remainingText = line
		if(remainingText.startsWith('^{')) {
			remainingText = parseMarkdownElementOptions(remainingText.substring(1), aside.options)
		} else {
			remainingText = remainingText.substring(2)
		}
		parseLine([ remainingText, ], 0, aside, hasChanged)
		return true
	}
	return false
}

function parseBlockquote(line: string, document: ParseResult, hasChanged: boolean) {
	if(line === '>') {
		line = '> '
	}

	if(line.startsWith('> ') || line.startsWith('>{')) {
		const currentContent = document.content[document.content.length - 1] || { type: 'none', }
		let blockquote: Block = { type: 'Blockquote', content: [ ], options: { }, }
		if(currentContent.type === 'Blockquote') {
			blockquote = currentContent
		} else {
			document.content.push({ ...blockquote, hasChanged, })
		}

		let remainingText = line
		if(remainingText.startsWith('>{')) {
			remainingText = parseMarkdownElementOptions(remainingText.substring(1), blockquote.options)
		} else {
			remainingText = remainingText.substring(2)
		}

		parseLine([ remainingText, ], 0, blockquote, hasChanged)
		return true
	}
	return false
}

function parsePreformattedBlock(line: string, document: ParseResult, hasChanged: boolean) {
	const currentContent = document.content[document.content.length - 1] || { type: 'none', }
	if(line.startsWith('```')) {
		if(currentContent.type === 'Preformatted') {
			document.content.push({ type: 'Empty', hasChanged, })
			return true
		}
		const options: ContentOptions = {}
		const remainingLine = line.substring(3)
		if(remainingLine.startsWith('{')) {
			parseMarkdownElementOptions(remainingLine, options)
		} else {
			const language = remainingLine
			if(language !== '') {
				options['default'] = language
			}
		}
		document.content.push({ type: 'Preformatted', content: [], options, hasChanged, })
		return true
	}

	if(currentContent.type === 'Preformatted') {
		if(currentContent.content.length > 0) {
			currentContent.content.push( { type: 'Newline', })
		}
		let remaining: string = line

		while(remaining.length > 0 && remaining.indexOf('=>{') >= 0) {
			const parseResult = parseArrow(remaining, '=>{', currentContent.content)
			if(parseResult === null) {
				break
			}
			remaining = parseResult	
		}
	
		if(remaining.length > 0) {
			currentContent.content.push({
				type: 'Text',
				content: remaining,
			})
		}
	/*
		.push({
			type: 'Text',
			content: line,
		})
*/
		return true
	}
	return false
}

function parseHorizontalRule(line: string, document: ParseResult, hasChanged: boolean, lineNumber: number) {
	if(line.trim() === '---') {
		const options: ContentOptions = {
			optionsStart: ''+(line.indexOf('---')+'---'.length),
			optionsLine: ''+lineNumber,
			optionsLength: ''+0,
		}
		postprocessHorizontalRuleOptions(options)
		document.content.push({ type: 'HorizontalRule', level: 1, hasChanged, options, })
		return true
	} else if(line.trim().startsWith('---{')) {
		const options: ContentOptions = {}
		const remainingText = parseMarkdownElementOptions(line.substring('---'.length), options)
		postprocessHorizontalRuleOptions(options)
		const optionsStart = line.indexOf('---')+'---'.length
		options.optionsLine = ''+lineNumber
		options.optionsStart = ''+optionsStart
		options.optionsLength = ''+(line.length - remainingText.length - optionsStart)

		document.content.push({ type: 'HorizontalRule', level: 1, hasChanged, options, })
		return true
	}
	return false
}


const endedByEmptyLine = [
	'Paragraph',
	'Aside',
	'Blockquote',
	'Table',
]
function parseParagraph(line: string, document: ParseResult, hasChanged: boolean): boolean {
	if(line.trim().length > 0) {
		const currentContent = document.content[document.content.length - 1] || { type: 'none', }
		if(currentContent.type === 'Paragraph') {
			if(line.startsWith('{') && !currentContent.options) {
				currentContent.options = {}
				line = parseMarkdownElementOptions(line, currentContent.options)
			}
			if(currentContent.content.length > 0) {
				currentContent.content.push({ type: 'Newline', })
			}
			parseParagraphLine(line, currentContent.content)
		} else {
			const paragraph: Paragraph & DefaultContent = { type: 'Paragraph', content: [], hasChanged, }
			parseParagraphLine(line, paragraph.content)
			document.content.push(paragraph)
		}
	} else {
		const currentContent = document.content[document.content.length - 1] || { type: 'none', }
		if(endedByEmptyLine.find(e => e === currentContent.type)) {
			document.content.push({ type: 'Paragraph', content: [], hasChanged, })
		}
	}
	return true
}

type TagParser = (remainingLine: string, startTag: string, pushTo: ParagraphContent[])=>string | null
const allTagParsers: {[key: string]: TagParser, } = {
	'**': parseBold,
	'__': parseBold,
	'*': parseItalic,
	'_': parseItalic,
	'~~': parseStrikeThrough,
	'```': parseInlineCode,
	'``': parseInlineCode,
	'`': parseInlineCode,
	'[': parseLink,
	'![': parseImageLink,
	'=>{': parseArrow,
}

function parseParagraphLine(line: string, pushTo: ParagraphContent[]) {
	let remainingLine: string = line

	while(remainingLine.length > 0) {
		const tagStarts = Object
			.keys(allTagParsers)
			.reduce((result: {[key: string]: number, }, key: string) => {
				const index = remainingLine.indexOf(key)
				if(index >= 0) {
					result[key] = index
				}
				return result
			}, {})
		const earliestTagStart = Object
			.keys(tagStarts)
			.reduce((result: [string, number], key: string): [string, number] => {
				if(tagStarts[key] < result[1]) {
					return [ key, tagStarts[key], ]
				}
				return result
			}, [ '', Number.MAX_SAFE_INTEGER, ])

		if(earliestTagStart[0] === '') {
			break
		}
		const parser = allTagParsers[earliestTagStart[0]]
		const parseResult = parser(remainingLine, earliestTagStart[0], pushTo)
		if(parseResult === null) {
			break
		}
		remainingLine = parseResult
	}

	if(remainingLine.length > 0) {
		if(remainingLine.endsWith('  ')) {
			pushTo.push({
				type: 'Text',
				content: remainingLine.substring(0, remainingLine.length-2),
			})
			pushTo.push({
				type: 'LineBreak',
			})
		} else {
			pushTo.push({
				type: 'Text',
				content: remainingLine,
			})
		}
	}
}

function parseBold(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	return parseBoldItalicEtc('Bold', remainingLine, startTag, pushTo)
}
function parseItalic(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	return parseBoldItalicEtc('Italic', remainingLine, startTag, pushTo)
}
function parseStrikeThrough(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	return parseBoldItalicEtc('StrikeThrough', remainingLine, startTag, pushTo)
}
function parseBoldItalicEtc(type: 'Bold' | 'Italic' | 'StrikeThrough', remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	const tagIndex = remainingLine.indexOf(startTag)
	if(tagIndex >= 0) {
		if(remainingLine.length > tagIndex + startTag.length) {
			const isItalic = startTag==='_' || startTag==='*'
			if(isItalic && remainingLine[tagIndex + startTag.length]===startTag[0]) {
				//Cannot be italic, since another same character means that it's bold.
				return null
			}
			const closingTagIndex = remainingLine.indexOf(startTag, tagIndex + startTag.length)
			if(closingTagIndex > 0) {
				if(tagIndex > 0) {
					pushTo.push({
						type: 'Text',
						content: remainingLine.substring(0, tagIndex),
					})
				}
				const paragraphContent: ParagraphContent[] = []
				let textContent = remainingLine.substring(tagIndex + startTag.length, closingTagIndex)

				const options: ContentOptions = {}
				if(textContent.startsWith('{')) {
					textContent = parseMarkdownElementOptions(textContent, options)
				}
				parseParagraphLine(textContent, paragraphContent)

				const newContent: BoldTextContent | ItalicTextContent | StrikeThroughTextContent = {
					type,
					content: paragraphContent,
					options,
				}
				pushTo.push(newContent)
				return remainingLine.substring(closingTagIndex + startTag.length)
			}
		}
	}
	return null
}

function parseInlineCode(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	const tagIndex = remainingLine.indexOf(startTag)
	if(tagIndex >= 0) {
		if(remainingLine.length > tagIndex + startTag.length) {
			const closingTagIndex = remainingLine.indexOf(startTag, tagIndex + startTag.length)
			if(closingTagIndex > 0) {
				if(tagIndex > 0) {
					pushTo.push({
						type: 'Text',
						content: remainingLine.substring(0, tagIndex),
					})
				}
				const options: ContentOptions = {}
				let blockString = remainingLine.substring(tagIndex + startTag.length)
				if(blockString.startsWith('{')) {
					blockString = parseMarkdownElementOptions(blockString, options)
				}

				const codeContent: (TextContent | Arrow)[] = []
				const closingTagInBlockString = blockString.indexOf(startTag)
				parseInlineCodeContent(blockString.substring(0, closingTagInBlockString), codeContent)
				pushTo.push({
					type: 'InlineCode',
					content: codeContent,
					options,
				})
				return remainingLine.substring(closingTagIndex + startTag.length)
			}
		}
	}
	return null
}

function parseInlineCodeContent(codeBlockToParse: string, pushTo: (TextContent | Arrow)[]) {
	let remaining: string = codeBlockToParse

	while(remaining.length > 0 && remaining.indexOf('=>{') >= 0) {
		const parseResult = parseArrow(remaining, '=>{', pushTo)
		if(parseResult === null) {
			break
		}
		remaining = parseResult	
	}

	if(remaining.length > 0) {
		pushTo.push({
			type: 'Text',
			content: remaining,
		})
	}
}

function parseLink(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	const tagIndex = remainingLine.indexOf(startTag)
	if(tagIndex >= 0) {
		if(remainingLine.length > tagIndex + startTag.length) {
			const middleTag = ']('
			const middleTagIndex = remainingLine.indexOf(middleTag, tagIndex + startTag.length)
			const closingTagIndex = remainingLine.indexOf(')', middleTagIndex + middleTag.length)

			if(middleTagIndex > 0 && closingTagIndex > 0) {
				if(tagIndex > 0) {
					pushTo.push({
						type: 'Text',
						content: remainingLine.substring(0, tagIndex),
					})
				}
				const options: ContentOptions = {}
				let textAfterLink = remainingLine.substring(closingTagIndex + startTag.length)
				if(textAfterLink.startsWith('{')) {
					textAfterLink = parseMarkdownElementOptions(textAfterLink, options)
				}
				pushTo.push({
					type: 'InlineLink',
					description: remainingLine.substring(tagIndex + startTag.length, middleTagIndex),
					href: remainingLine.substring(middleTagIndex + middleTag.length, closingTagIndex),
					options
				})
				return textAfterLink
			}
		}
	}
	return null
}

function parseImageLink(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	const linkData: ParagraphContent[] = []
	const returnLine = parseLink(remainingLine.substring(1), '[', linkData)
	if(linkData.length >= 1) {
		linkData.forEach(d => {
			if(d.type === 'InlineLink') {
				pushTo.push({
					type: 'InlineImage',
					description: d.description,
					href: d.href,
					options: d.options,
				})
			} else {
				pushTo.push(d)
			}
		})
		return returnLine
	}
	return null
}

function parseArrow(remainingLine: string, startTag: string, pushTo: ParagraphContent[]) {
	startTag = startTag.substring(0, startTag.length-1)
	const tagIndex = remainingLine.indexOf(startTag)
	if(tagIndex >= 0) {
		if(remainingLine.length > tagIndex + startTag.length) {
			if(tagIndex > 0) {
				pushTo.push({
					type: 'Text',
					content: remainingLine.substring(0, tagIndex),
				})
			}

			const options: ContentOptions = {}
			let blockString = remainingLine.substring(tagIndex + startTag.length)
			if(!blockString.startsWith('{')) {
				throw new Error('Illegal state: Arrows always must have options!')
			}
			blockString = parseMarkdownElementOptions(blockString, options)
			let closingIndexSpace = blockString.indexOf(' ')
			let closingIndexArrow = blockString.indexOf('=>{')
			let closingIndex = closingIndexArrow >= 0 && closingIndexArrow < closingIndexSpace? closingIndexArrow : closingIndexSpace

			if(closingIndex < 0) {
				closingIndex = blockString.length
			}
			pushTo.push({
				type: 'Arrow',
				pointingTo: blockString.substring(0, closingIndex),
				options,
			})
			return blockString.substring(closingIndex)
		}
	}
	return null
}

function parseMarkdownElementOptions(potentialOptionsLine: string, options: ContentOptions) {
	const endIndex = potentialOptionsLine.indexOf('}')
	if(potentialOptionsLine.startsWith('{') && endIndex >= 0) {
		const gatheredOptions: ContentOptions = {}
		const optionsContent = potentialOptionsLine
			.substring(1, endIndex)
			.split(';')
		for(let i = 0; i < optionsContent.length; i++) {
			const option = optionsContent[i]

			const equalsIndex = option.indexOf('=')
			if(equalsIndex >= 0) {
				const key = option.substring(0, equalsIndex).trim()
				const value = option.substring(equalsIndex + 1).trim()
				gatheredOptions[key] = value
			} else if(i === 0) {
				gatheredOptions['default'] = option.trim()
			} else {
				//Incomplete option detected: Return all options parsed so far, but stop here.
				Object.assign(options, gatheredOptions)
				return potentialOptionsLine.substring(endIndex + 1)
			}
		}
		Object.assign(options, gatheredOptions)
		return potentialOptionsLine.substring(endIndex + 1)
	}
	return potentialOptionsLine
}
