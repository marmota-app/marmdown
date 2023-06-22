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

export function isWhitespace(character: string) {
	switch(character) {
		case ' ': case '\t': case '\u00A0': case '\u1680': case '\u2000':
		case '\u2001': case '\u2002': case '\u2003': case '\u2004': case '\u2005':
		case '\u2006': case '\u2007': case '\u2008': case '\u2009': case '\u200A':
		case '\u202F': case '\u205F': case '\u3000': return true
	}
	return false
}
