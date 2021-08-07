import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default defineConfig({
	input: "var/code/main.ts",
	output: {
		file: "var/output/bundle.js",
		format: "iife",
		sourcemap: false,
		strict: false,
		preferConst: true,
	},
	plugins: [
		typescript({
			tsconfig: "./tsconfig.yare.json",
		}),
		nodeResolve(),
		babel({
			babelHelpers: "bundled",
			babelrc: false,
			presets: [],
			sourceType: "script",
		}),
	],
});
