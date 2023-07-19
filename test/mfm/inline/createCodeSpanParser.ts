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

import { NumberedIdGenerator } from "$markdown/IdGenerator"
import { MfMCodeSpanParser } from "$mfm/inline/MfMCodeSpan"
import { MfMTextParser } from "$mfm/inline/MfMText"
import { createOptionsParser } from "../options/createOptionsParser"

export function createCodeSpanParser() {
	const idGenerator = new NumberedIdGenerator()
	const codeSpanParser = new MfMCodeSpanParser({ idGenerator, MfMOptions: createOptionsParser(idGenerator), MfMText: new MfMTextParser({ idGenerator })})
	return { codeSpanParser, idGenerator }
}