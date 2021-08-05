import process from "process";

import chalk from "chalk";

import { YareServer } from "./yare/server";
import { configure } from "./config";

async function waitForTermination(
	server: YareServer<string, string>,
): Promise<void> {
	return new Promise<void>((resolve) => {
		process.on("SIGINT", async () => {
			console.log(
				chalk.yellowBright(
					"Received notice to terminate, logging out...",
				),
			);
			await server.logout();
			console.log("Logged out!");
			resolve();
		});
	});
}

async function serve(): Promise<string | void> {
	const serverConfig = await configure({ domain: "yare.io", server: "d1" });

	const server = new YareServer({
		domain: serverConfig.domain,
		server: serverConfig.server,
	});
	await server.login(serverConfig.username, serverConfig.password);
	const gameIds = await server.fetchGameIds();

	if (gameIds.length > 0) {
		const gameId = gameIds[0];
		console.log(chalk.greenBright(`Connecting to game ${gameId}...`));
		server.subscribe(gameId, "message", (data) =>
			console.log(JSON.stringify(data)),
		);
		return await waitForTermination(server);
	}

	return chalk.yellowBright("No games found, exiting...");
}

serve()
	.then((msg: string | void) => {
		if (!msg) {
			msg = "Server closed.";
		}
		console.log(msg);
		process.exit();
	})
	.catch((err) => {
		if (err instanceof Error) {
			throw err;
		}
		throw new Error(err);
	});
