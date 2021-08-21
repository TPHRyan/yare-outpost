import process from "process";
import chalk from "chalk";

import { CliContext, Subcommand } from "../cli";
import { Logger } from "../logger";
import { getHttpClient } from "../net/http";
import { createWebSocket } from "../net/ws";
import { CodeWatcher, watchCode } from "../watcher/watcher";
import { Game, Server as YareServer } from "../yare";

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
	const { username, password } = await config.getCredentials();
	await server.login(username, password);
	return server;
}

async function initWatcher(
	entrypoint: string,
	games: readonly Game[],
	logger: Logger,
): Promise<CodeWatcher> {
	logger.info(chalk.greenBright("Starting watcher..."));
	const codeWatcher = watchCode(entrypoint, "./var/output");
	codeWatcher.code$.subscribe({
		next: async (code) => {
			logger.debug(`Generated code:\n${code}`);
			if (games.length > 0) {
				await Promise.all(games.map((game) => game.sendCode(code)));
				logger.info(`Successfully updated code for all games!`);
			} else {
				logger.info(`Code change detected!`);
			}
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

	const gameIds = games.map((game) => game.id);
	logger.info(
		chalk.greenBright(
			gameIds.length > 0
				? `Updating code live for games ${JSON.stringify(gameIds)}...`
				: "Watching for code changes...",
		),
	);

	await initWatcher("./var/code/main.ts", games, logger);

	await ctx.stop;
	return await server.onDisconnect();
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
