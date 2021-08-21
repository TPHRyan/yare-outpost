import process from "process";
import chalk from "chalk";

import { CliContext, Subcommand } from "../cli";
import { getHttpClient } from "../net/http";
import { createWebSocket } from "../net/ws";
import { Server as YareServer } from "../yare";

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

	ctx.code$.subscribe({
		next: async (code) => {
			logger.debug(`Generated code:\n${code}`);
			if (games.length > 0) {
				await Promise.all(games.map((game) => game.sendCode(code)));
				logger.info(`Successfully updated code for all games!`);
			} else {
				logger.info(`Code change detected!`);
			}
		},
	});

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
