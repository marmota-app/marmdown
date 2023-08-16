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

import { Marmdown } from "../../../src/Marmdown";
import { MfMDialect } from "../../../src/MfMDialect";
import { MfMContainer } from "../../../src/mfm/MfMContainer";
import { MfMImage } from "../../../src/mfm/inline/link/MfMLink";
import { MfMOptions } from "../../../src/mfm/options/MfMOptions";

export function parseMarkdown(text: string) {
	const md = new Marmdown(new MfMDialect({
		optionsPostprocessors: {
			'image': [
				(image: MfMImage, options: MfMOptions, setOption: (key: string, value: string) => unknown) => {
					const target = image.destination?.target?.toLowerCase()
					if(target) {
						if(
							target.startsWith('https://youtu.be') ||
							target.startsWith('https://vimeo.com') ||
							target.startsWith('https://www.youtube.com') ||
							target.endsWith('.mp4') ||
							target.endsWith('.mov') ||
							target.endsWith('.avi') ||
							target.endsWith('.wmv') ||
							target.endsWith('.webm')
						) {
							setOption('type', 'video')
						}
					}
				}
			]
		}
	}))

	md.textContent = text

	return toLegacy(md)
}

function toLegacy(md: Marmdown<MfMContainer>) {
	return md.document!
}