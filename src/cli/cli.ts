import chalk from "chalk";
import { configure } from "../config";
import { CodeWatcher, watchCode } from "../watcher/watcher";
import { EarlyCliContext } from "./cli-context.model";
import { Subcommand, SubcommandArgs } from "./subcommand";

async function initWatcher(
	entrypoint: string,
	ctx: EarlyCliContext,
): Promise<CodeWatcher> {
	ctx.logger.info(chalk.greenBright("Starting watcher..."));
	const codeWatcher = watchCode(entrypoint, "./var/output", ctx.events$);
	codeWatcher.code$.subscribe({
		error: (err) => ctx.logger.error(err),
		complete: () => ctx.logger.debug("Watcher closed."),
	});
	return codeWatcher;
}

async function runSubcommand<Args extends SubcommandArgs>(
	args: Args,
	ctx: EarlyCliContext,
	subcommand: Subcommand<Args>,
): Promise<void> {
	const watcher = await initWatcher("./var/code/main.ts", ctx);
	await subcommand(
		{
			...ctx,
			code$: watcher.code$,
			config: await configure(
				{
					domain: "yare.io",
				},
				ctx,
			),
		},
		args,
	);
	return await watcher.close();
}

export class UnknownCommandError extends Error {}

export function outpost<Args extends SubcommandArgs>(
	args: Args,
	ctx: EarlyCliContext,
	subcommand: Subcommand<Args>,
): void {
	runSubcommand(args, ctx, subcommand)
		.then()
		.catch((reason) => {
			throw reason;
		});
}
