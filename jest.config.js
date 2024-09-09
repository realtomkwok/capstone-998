module.exports = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.(ts|tsx)?$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
	transformIgnorePatterns: [
		"node_modules/(?!axios/)"
	],
	moduleNameMapper: {
		'^@lib/(.*)$': '<rootDir>/src/lib/$1',
		"^axios$": "<rootDir>/node_modules/axios/dist/node/axios.cjs"
	}
};