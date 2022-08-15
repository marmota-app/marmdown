// Ensuring Compatibility with Older Presentations
// ===============================================
//
// Sometimes, how we use options to render parts of a presentation changes;
// e.g. we renamed "color=highlight" to "slide-design=highlight" for horizontal
// rules.
//
// To ensure backwards compatibility, the post processors in this file can
// translate the old option to the new one. The rendering code in <Presentation />
// then only has to know about the new options.

import { ContentOptions } from "./MarkdownOptions"

export function postprocessHeadingOptions(options: ContentOptions, level: number) {
	if(options['slide-color']) {
		options['slide-design'] = options['slide-color']
	}
	if(!options['break']) {
		if(level === 1) {
			options['break'] = 'slide'
		}
		if(level === 2) {
			options['break'] = 'column'
		}
	}
}

export function postprocessHorizontalRuleOptions(options: ContentOptions) {
	if(options['color']) {
		options['slide-design'] = options['color']
	}
	if(!options['break']) {
		options['break'] = 'slide-always'
	}
}
