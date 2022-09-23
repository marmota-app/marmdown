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
import { TextParser } from "./parser/TextParser"

export function parsers<NAMES extends string>(all: { [key in NAMES]: TextParser<any>}, extract: NAMES[]): TextParser<any>[] {
	return extract.map(name => all[name])
}

export interface Parsers<NAMES extends string> {
	names: () => readonly string[],
	knownParsers: () => { [key in NAMES]: TextParser<any>},
	toplevel: () => TextParser<any>[],
}