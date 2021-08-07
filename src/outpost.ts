import process from "process";

import chalk from "chalk";

import { configure, ConnectionConfig } from "./config";
import { YareServer } from "./yare/server";
import { CodeWatcher, watchCode } from "./watcher";

async function waitForTermination(
	server: YareServer<string, string>,
): Promise<string> {
	return new Promise((resolve) => {
		process.on("SIGINT", async () => {
			console.log(
				chalk.yellowBright(
					"Received notice to terminate, logging out...",
				),
			);
			await server.logout();
			console.log("Logged out!");
			resolve("Server closed.");
		});
	});
}

async function initServer<Domain extends string, Server extends string>(
	config: ConnectionConfig<Domain, Server>,
): Promise<YareServer<Domain, Server>> {
	const serverConfig = await configure(config);

	const server = new YareServer({
		domain: serverConfig.domain,
		server: serverConfig.server,
	});
	await server.login(serverConfig.username, serverConfig.password);
	return server;
}

async function initWatcher<Domain extends string, Server extends string>(
	entrypoint: string,
	_server: YareServer<Domain, Server>,
): Promise<CodeWatcher> {
	console.log(chalk.greenBright("Starting watcher..."));
	const codeWatcher = watchCode(entrypoint);
	codeWatcher.code$.subscribe({
		next: (code) => console.log(`Generated code:\n${code}`),
		error: (err) => console.log(err),
		complete: () => console.log("Watcher closed."),
	});
	return codeWatcher;
}

async function outpost(): Promise<string> {
	const server = await initServer({ domain: "yare.io", server: "d1" });
	const gameIds = await server.fetchGameIds();

	if (gameIds.length > 0) {
		const gameId = gameIds[0];
		console.log(chalk.greenBright(`Connecting to game ${gameId}...`));
		console.log(chalk.yellow("(Not really, not implemented)"));

		await initWatcher("./var/code/main.ts", server);

		return await waitForTermination(server);
	}

	return chalk.yellowBright("No games found, exiting...");
}

outpost()
	.then((msg: string) => {
		console.log(msg);
		process.exit();
	})
	.catch((err) => {
		if (err instanceof Error) {
			throw err;
		}
		throw new Error(err);
	});
