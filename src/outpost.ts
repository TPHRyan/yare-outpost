import process from "process";

import chalk from "chalk";

import { defaultSubcommands, outpost } from "./cli";
import { createLogger } from "./logger";

const logger = createLogger();

const stop = new Promise<void>((resolve) =>
	process.on("SIGINT", () => resolve()),
);

try {
	outpost(
		{ logger, stdin: process.stdin, stdout: process.stdout, stop },
		defaultSubcommands,
	);
} catch (e) {
	const message = e.message ?? JSON.stringify(e);
	logger.error(chalk.red(`ERROR: ${message}`));
	process.exit(1);
}
