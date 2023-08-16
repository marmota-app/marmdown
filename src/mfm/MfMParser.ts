/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Element } from "../element/Element";
import { ContentUpdate } from "../ContentUpdate";
import { Parser } from "../parser/Parser";
import { MfMOptions } from "./options/MfMOptions";

export interface MfMElement extends Element<unknown, unknown, unknown, unknown> {
	readonly options: MfMOptions,
}

export abstract class MfMParser<
	RESULT extends MfMElement,
	META_RESULT extends Element<unknown, unknown, unknown, unknown> | unknown=RESULT,
	REQUIRED_PARSERS extends Parser<Element<unknown, unknown, unknown, unknown>> = any,
> extends Parser<RESULT, META_RESULT, REQUIRED_PARSERS> {
	override canUpdate(original: RESULT, update: ContentUpdate, replacedText: string): boolean {
		//When the options are not fully parsed, the element cannot be updated:
		//An update might add another options line at the end of the options,
		//but the update parser would have no way to know that this update
		//should be part of the options, and would add the text to the element's
		//content instead!
		return original.options.isFullyParsed
	}
}
