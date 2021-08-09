import { InputOption, OutputOptions, RollupBuild, watch } from "rollup";
import { Observable, Subject } from "rxjs";

import config from "../rollup.config";

async function generateBundleCode(bundle: RollupBuild): Promise<string> {
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

export interface CodeWatcher {
	code$: Observable<string>;

	close(): Promise<void>;
}

export function watchCode(entrypoint: InputOption): CodeWatcher {
	const rollupWatcher = watch({
		...config,
		input: entrypoint,
		watch: {
			buildDelay: 50,
			clearScreen: false,
			skipWrite: true,
		},
	});
	const code$: Subject<string> = new Subject();
	rollupWatcher.on("event", async (event) => {
		if ("BUNDLE_END" === event.code) {
			const code = await generateBundleCode(event.result);
			code$.next(code);
		} else if ("ERROR" === event.code) {
			code$.error(event.error);
		}
		if ("result" in event) {
			event.result?.close();
		}
	});

	rollupWatcher.on("close", () => code$.complete());
	return {
		code$: code$,
		async close() {
			rollupWatcher.close();
		},
	};
}
