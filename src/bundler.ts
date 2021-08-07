import { OutputOptions, rollup } from "rollup";
import config from "../rollup.config";

export async function generateCodeBundle(): Promise<string> {
	const bundle = await rollup(config);

	const { output } = await bundle.generate(config.output as OutputOptions);
	let bundleString = "";
	for (const chunkOrAsset of output) {
		if ("chunk" === chunkOrAsset.type) {
			bundleString += chunkOrAsset.code;
		}
	}

	await bundle.close();
	return bundleString;
}
