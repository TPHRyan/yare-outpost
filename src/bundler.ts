import {
	InputOption,
	OutputOptions,
	RollupBuild,
	RollupError,
	watch,
} from "rollup";
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

type CloseHandler = () => void;
type ErrorHandler = (err: RollupError) => void;
type GenerateHandler = (code: string) => void;

export interface CodeWatcher {
	on(event: "close", handler: CloseHandler): void;
	on(event: "error", handler: ErrorHandler): void;
	on(event: "generate", handler: GenerateHandler): void;
	close(): Promise<void>;
}

type HandlersForEvents = {
	close: CloseHandler;
	error: ErrorHandler;
	generate: GenerateHandler;
};
type CodeWatcherEventType = keyof HandlersForEvents;
type HandlerFor<Event extends string> = Event extends keyof HandlersForEvents
	? HandlersForEvents[Event]
	: never;

export function startWatcher(entrypoint: InputOption): CodeWatcher {
	const closeHandlers: CloseHandler[] = [];
	const errorHandlers: ErrorHandler[] = [];
	const generateHandlers: GenerateHandler[] = [];

	const rollupWatcher = watch({
		...config,
		input: entrypoint,
	});

	rollupWatcher.on("event", async (event) => {
		if ("BUNDLE_END" === event.code) {
			const code = await generateBundleCode(event.result);
			generateHandlers.forEach((handler) => handler(code));
		} else if ("ERROR" === event.code) {
			errorHandlers.forEach((handler) => handler(event.error));
		}
		if ("result" in event) {
			event.result?.close();
		}
	});

	rollupWatcher.on("close", () =>
		closeHandlers.forEach((handler) => handler()),
	);

	return {
		on<Event extends CodeWatcherEventType>(
			event: Event,
			handler: HandlerFor<Event>,
		): void {
			switch (event) {
				case "close":
					closeHandlers.push(handler as CloseHandler);
					break;
				case "error":
					errorHandlers.push(handler as ErrorHandler);
					break;
				case "generate":
					generateHandlers.push(handler as GenerateHandler);
					break;
				default:
					throw new Error(`Unrecognized event type ${event}!`);
			}
		},
		async close() {
			rollupWatcher.close();
		},
	};
}
