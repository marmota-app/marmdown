import type {Config} from '@jest/types'

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
	moduleNameMapper: {
		"^\\$markdown(.*)$": "<rootDir>/src$1",
	}
};
export default config
