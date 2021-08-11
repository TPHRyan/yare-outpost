import process from "process";

import chalk from "chalk";

import { configure, OutpostConfig } from "./config";
import { createLogger } from "./logger";
import { getHttpClient } from "./net/http";
import { createWebSocket } from "./net/ws";
import { CodeWatcher, watchCode } from "./watcher";
import { Server as YareServer } from "./yare";

const logger = createLogger();

async function waitForTermination(server: YareServer<string>): Promise<string> {
	return new Promise((resolve) =>
		process.on("SIGINT", () =>
			server.onDisconnect().then((message: string) => resolve(message)),
		),
	);
}

async function initServer<Domain extends string>(
	config: OutpostConfig<Domain>,
): Promise<YareServer<Domain>> {
	const serverConfig = await configure(config);

	const server = new YareServer(
		{
			domain: serverConfig.domain,
			logger: serverConfig.logger,
		},
		{
			http: getHttpClient(),
			wsFactory: createWebSocket,
		},
	);
	await server.login(serverConfig.username, serverConfig.password);
	return server;
}

async function initWatcher<Domain extends string>(
	entrypoint: string,
	_server: YareServer<Domain>,
): Promise<CodeWatcher> {
	logger.info(chalk.greenBright("Starting watcher..."));
	const codeWatcher = watchCode(entrypoint);
	codeWatcher.code$.subscribe({
		next: (code) => logger.debug(`Generated code:\n${code}`),
		error: (err) => logger.error(err),
		complete: () => logger.debug("Watcher closed."),
	});
	return codeWatcher;
}

async function outpost(): Promise<string> {
	logger.setLevel("debug");

	const server = await initServer({
		domain: "yare.io",
		logger,
	});
	const games = await server.fetchGames();

	if (games.length > 0) {
		const game = games[0];
		logger.info(chalk.greenBright(`Connecting to game ${game.id}...`));
		logger.warn(chalk.yellow("(Not really, not implemented)"));

		await initWatcher("./var/code/main.ts", server);

		return await waitForTermination(server);
	}

	return chalk.yellowBright("No games found, exiting...");
}

outpost()
	.then((msg: string) => {
		logger.info(msg);
		process.exit();
	})
	.catch((err) => {
		if (err instanceof Error) {
			throw err;
		}
		throw new Error(err);
	});
