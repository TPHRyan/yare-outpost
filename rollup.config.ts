import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

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
	],
});
