import process from "process";

import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { EarlyCliContext, outpost, Subcommands } from "./cli";
import { createEventStream } from "./events";
import { createLogger } from "./logger";
import serveClients from "./serve-clients";
import start from "./start.subcommand";
import syncCode from "./sync-code";

async function processArgs(
	argv: string[],
	ctx: EarlyCliContext,
	subcommands: Subcommands,
): Promise<void> {
	const cli = yargs(hideBin(argv))
		.scriptName("outpost")
		.usage(
			"$0 [command]",
			false,
			(a) => a,
			(_) => yargs.showHelp("log"),
		)
		.help();
	for (const [name, subcommand] of Object.entries(subcommands)) {
		cli.command(
			name,
			subcommand.description ?? "",
			(argv) => argv,
			(args) => outpost(args, ctx, subcommand),
		);
	}
	await cli.argv;
}

const logger = createLogger();
logger.setLevel("info");

const stop = new Promise<void>((resolve) =>
	process.on("SIGINT", () => resolve()),
);

processArgs(
	process.argv,
	{
		events$: createEventStream(),
		logger,
		stdin: process.stdin,
		stdout: process.stdout,
		stop,
	},
	{
		"serve-clients": serveClients,
		start: start,
		"sync-code": syncCode,
	},
)
	.then()
	.catch((e) => {
		const message = e.message ?? JSON.stringify(e);
		logger.error(chalk.red(`ERROR: ${message}`));
		process.exit(1);
	});
