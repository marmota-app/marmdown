/*
Copyright [2020-2022] [David Tanzer - @dtanzer@social.devteams.at]

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

import { ContentUpdate } from "./ContentUpdate";
import { ContainerBlock } from "$element/Element";
import { Dialect } from "$parser/Dialect";
import { MfMContainer } from "./mfm/MfMContainer";

/**
 * All known parsers for the "Marmota Flavored Markdown" dialect. 
 */
export class MfMDialect implements Dialect<MfMContainer> {
	createEmptyDocument(): MfMContainer {
		return new MfMContainer('dummy', 'dummy')
	}
	parseCompleteText(text: string): MfMContainer {
		return new MfMContainer('dummy', 'dummy')
	}
	parseUpdate(document: MfMContainer, update: ContentUpdate): MfMContainer {
		return document
	}
}
