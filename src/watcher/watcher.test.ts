import fs from "fs";
import path from "path";
import util from "util";

import { firstValueFrom } from "rxjs";
import { createEventStream } from "../events";
import { CodeChangedEvent } from "./events";
import { CodeWatcher, watchCode } from "./watcher";

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

async function updateTestCode(
	entrypoint: string,
	contents: string = "",
): Promise<void> {
	const codeDir = path.dirname(entrypoint);
	await mkdir(path.join(codeDir, "output"), {
		recursive: true,
	});
	return await writeFile(entrypoint, contents);
}

let watcher: CodeWatcher;

const entrypoint = path.sep + path.join("tmp", "outpost", "main.ts");
const outputDir = path.sep + path.join("tmp", "outpost", "output");

const helloWorldString = "Hello, world!";

describe("code watcher", () => {
	afterEach(async () => {
		if (watcher) {
			await watcher.close();
		}
	});

	it("should start without error", async () => {
		await updateTestCode(entrypoint);
		watcher = watchCode(entrypoint, outputDir);
	});

	it("should emit code changes", async () => {
		await updateTestCode(entrypoint, `console.log("${helloWorldString}");`);
		watcher = watchCode(entrypoint, outputDir);
		const code = await firstValueFrom(watcher.code$);
		expect(code).toContain(helloWorldString);
	});

	it("should emit a codeChanged event", async () => {
		const eventStream = createEventStream();
		let eventReceived = false;
		eventStream.subscribeTo("codeChanged", {
			next: (e: CodeChangedEvent) => {
				expect(typeof e).toBe("object");
				expect(e).toHaveProperty("type", "codeChanged");
				expect(e).toHaveProperty("payload");
				expect(e.payload).toHaveProperty("code");
				eventReceived = true;
			},
		});

		await updateTestCode(entrypoint, `console.log("${helloWorldString}");`);
		watcher = watchCode(entrypoint, outputDir, eventStream);

		await firstValueFrom(watcher.code$);
		expect(eventReceived).toBe(true);
	});
});
