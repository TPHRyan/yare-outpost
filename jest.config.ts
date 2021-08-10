import { InitialOptionsTsJest } from "ts-jest/dist/types";

module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	rootDir: "./src",
	globals: {
		"ts-jest": {
			tsconfig: "./tsconfig.test.json",
		},
	},
} as InitialOptionsTsJest;
