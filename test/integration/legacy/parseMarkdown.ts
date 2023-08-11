import { Marmdown } from "$markdown/Marmdown";
import { MfMDialect } from "$markdown/MfMDialect";
import { MfMContainer } from "$mfm/MfMContainer";
import { MfMImage } from "$mfm/inline/link/MfMLink";
import { MfMOptions } from "$mfm/options/MfMOptions";

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