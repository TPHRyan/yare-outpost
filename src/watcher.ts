import { build, BuildFailure, BuildResult } from "esbuild";
import { Observable, Subject } from "rxjs";

import buildConfig from "../build.config";

const PATTERN_FILENAME_COMMENT = /\n\s*\/\/ .*?\n/m;

function generateBundleCode(result: BuildResult): string | null {
	if (!result.outputFiles) {
		return null;
	}
	let bundleString = "";
	for (const file of result.outputFiles) {
		bundleString += file.text;
	}

	return bundleString;
}

function applySimpleTransforms(code: string): string {
	return code.replace(PATTERN_FILENAME_COMMENT, "\n");
}

function emitCodeChanges(result: BuildResult, code$: Subject<string>): void {
	const code = generateBundleCode(result);
	if (null !== code) {
		code$.next(applySimpleTransforms(code));
	}
}

async function startWatcher(
	entrypoint: string,
	code$: Subject<string>,
): Promise<BuildResult> {
	const result = await build({
		...buildConfig,
		entryPoints: [entrypoint],
		outdir: "./var/output",
		write: false,
		watch: {
			onRebuild: (
				error: BuildFailure | null,
				result: BuildResult | null,
			) => {
				if (null === result) {
					return;
				}
				emitCodeChanges(result, code$);
			},
		},
	});
	emitCodeChanges(result, code$);
	return result;
}

export interface CodeWatcher {
	code$: Observable<string>;

	close(): Promise<void>;
}

export function watchCode(entrypoint: string): CodeWatcher {
	const code$: Subject<string> = new Subject();
	const resultPromise = startWatcher(entrypoint, code$);
	return {
		code$: code$,
		async close() {
			const result = await resultPromise;
			result.stop;
		},
	};
}
