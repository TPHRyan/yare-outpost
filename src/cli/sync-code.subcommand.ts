import process from "process";
import chalk from "chalk";

import { Logger } from "../logger";
import { getHttpClient } from "../net/http";
import { createWebSocket } from "../net/ws";
import { CodeWatcher, watchCode } from "../watcher";
import { Game, Server as YareServer } from "../yare";

import { CliContext } from "./cli-context.model";
import { Subcommand } from "./subcommand";

async function initServer<Domain extends string>(
	ctx: CliContext<Domain>,
): Promise<YareServer<Domain>> {
	const config = ctx.config;
	const server = new YareServer(
		{
			domain: config.domain,
		},
		{
			http: getHttpClient(),
			logger: ctx.logger,
			wsFactory: createWebSocket,
		},
	);
	await server.login(config.username, config.password);
	return server;
}

async function initWatcher(
	entrypoint: string,
	game: Game,
	logger: Logger,
): Promise<CodeWatcher> {
	logger.info(chalk.greenBright("Starting watcher..."));
	const codeWatcher = watchCode(entrypoint);
	codeWatcher.code$.subscribe({
		next: async (code) => {
			logger.debug(`Generated code:\n${code}`);
			await game.sendCode(code);
			logger.info(`Successfully updated code for game ${game.id}!`);
		},
		error: (err) => logger.error(err),
		complete: () => logger.debug("Watcher closed."),
	});
	return codeWatcher;
}

async function syncCode(ctx: CliContext): Promise<string> {
	const logger = ctx.logger;

	const server = await initServer(ctx);
	const games = await server.fetchGames();

	if (games.length > 0) {
		const game = games[0];
		logger.info(
			chalk.greenBright(`Updating code live for game ${game.id}...`),
		);
		await initWatcher("./var/code/main.ts", game, logger);

		await ctx.stop;
		return await server.onDisconnect();
	}
	return chalk.yellowBright("No games found, exiting...");
}

const syncCodeSubcommand = async (
	ctx: CliContext,
	_args: string[] = [],
): Promise<void> => {
	const message = await syncCode(ctx);
	ctx.logger.info(message);
	process.exit();
};
syncCodeSubcommand.commandName = "sync-code";
syncCodeSubcommand.description =
	"watch for code changes and sync code with yare.io";

export default syncCodeSubcommand as Subcommand;
