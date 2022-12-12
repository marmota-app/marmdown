import type {Config} from '@jest/types'
import fs from 'fs'

function mapModules() {
	const tsconfigSource = fs.readFileSync('tsconfig.json', 'utf-8')
	const tsconfig = JSON.parse(tsconfigSource)

	const paths = tsconfig['compilerOptions']['paths']
	const result: { [key: string]: string } = {}

	Object.keys(paths).forEach(k => {
		if(!k.startsWith('*')) {
			const shortcut = k.substring(0, k.indexOf('/'))
			const path = paths[k][0].substring(0, paths[k][0].lastIndexOf('/'))

			result[`^\\${shortcut}(.*)$`] = `<rootDir>/${path}$1`
		}
	})

	return result
}

// Sync object
const config: Config.InitialOptions = {
	testEnvironment: "node",
	setupFilesAfterEnv: [ "<rootDir>/test/setup.ts",  ],
	preset: 'ts-jest',
	globals: {
		'ts-jest': {
			isolatedModules: true
		}
	},
	moduleNameMapper: mapModules()
};
export default config
