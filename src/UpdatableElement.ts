/*
   Copyright [2020-2022] [David Tanzer - @dtanzer]

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
import { ParsedDocumentContent, Updatable } from "./Updatable";
import { TextParser } from "./parser/TextParser";

export abstract class UpdatableElement<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT extends ParsedDocumentContent<UPDATABLE_TYPE, CONTENTS>=ParsedDocumentContent<CONTENTS, UPDATABLE_TYPE>> implements Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT> {
	constructor(
		public readonly contents: DOCUMENT_CONTENT[], public readonly parsedWith?: TextParser<CONTENTS, Updatable<UPDATABLE_TYPE, CONTENTS, DOCUMENT_CONTENT>, DOCUMENT_CONTENT>,
	) {
		contents.forEach(content => content.belongsTo = this)
	}
}
