import { build, BuildFailure, BuildResult } from "esbuild";
import { Observable, Subject } from "rxjs";

import { EventStream } from "../events";
import buildConfig from "../sync-code/build.config";
import { CodeChangedEvent } from "./events";

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

function emitCodeChanges(
	result: BuildResult,
	code$: Subject<string>,
	events$?: EventStream,
): void {
	const code = generateBundleCode(result);
	if (null !== code) {
		const event: CodeChangedEvent = {
			type: "codeChanged",
			payload: {
				code,
			},
		};
		events$?.next(event);
		code$.next(applySimpleTransforms(code));
	}
}

async function startWatcher(
	entrypoint: string,
	outputDir: string,
	code$: Subject<string>,
	events$?: EventStream,
): Promise<BuildResult> {
	const result = await build({
		...buildConfig,
		entryPoints: [entrypoint],
		outdir: outputDir,
		write: false,
		watch: {
			onRebuild: (
				error: BuildFailure | null,
				result: BuildResult | null,
			) => {
				if (null === result) {
					return;
				}
				emitCodeChanges(result, code$, events$);
			},
		},
	});
	emitCodeChanges(result, code$, events$);
	return result;
}

export interface CodeWatcher {
	code$: Observable<string>;

	close(): Promise<void>;
}

export function watchCode(
	entrypoint: string,
	outputDir: string,
	events$?: EventStream,
): CodeWatcher {
	const code$ = new Subject<string>();
	const resultPromise = startWatcher(entrypoint, outputDir, code$, events$);
	return {
		code$,
		async close() {
			const result = await resultPromise;
			result.stop?.();
		},
	};
}
