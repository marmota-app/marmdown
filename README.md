# Marmdown - Parser for marmota-flavored-markdown (MfM)

[marmota.app](https://marmota.app) is a presentation software that uses markdown
to create slides. But, in order to be able to embed additional information
into a presentation, it uses it's own markdown dialect: MfM.

marmdown is the parser for this markdown dialect&mdash;the second parser, that is.
The first parser was a very simplistic implementation that did only support the
most basic features.

## Getting Started

## The MfM Markdown Dialect

Marmota-flavored-markdown was inspired by, and tries to be mostly compatible to,
[GitHub Flavored Markdown (GfM)](https://github.github.com/gfm/)

Find out more about the specialities and compatibility [here]{@tutorial mfm}

## Design Goals

marmdown must be able to

* Parse any text file into a valid MfM document
* Be able to reproduce the original text of the document from the MfM document
* Allow changing the document structure and be able to reproduce a valid text file
* Parse document changes (like a single key stroke in an editor) selectively and only update the affected document nodes
* Be able to parse documents that the first parser was able to parse into a similar structure

Full compatibility with the first markdown parser is **not a design goal** - 
This will not be a drop-in replacement. But we adapted the tests from the
legacy parser anyway, to make sure that this parser supports the same use
cases. [See "Legacy Tests]{@tutorial legacy-tests}

[Read more about the design of marmdown]{@tutorial design}

## License

```
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
```
