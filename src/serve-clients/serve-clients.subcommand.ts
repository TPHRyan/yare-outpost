import { CliContext, Subcommand } from "../cli";
import { createWebSocketServer } from "../net/ws";
import { CodeChangedEvent } from "../watcher/events";

const serveClientsSubcommand = async (
	ctx: CliContext,
	_args: string[] = [],
): Promise<void> => {
	ctx.logger.info("Serving browser clients...");
	const server = createWebSocketServer(8083);
	server.connection$.subscribe(async (webSocket) => {
		ctx.events$.subscribeTo("codeChanged", {
			next: (event?: CodeChangedEvent) => {
				if (event) {
					webSocket.send(event).then();
				}
			},
		});
		webSocket.close();
	});
	await ctx.stop;
	server.close();
};
serveClientsSubcommand.commandName = "serve-clients";
serveClientsSubcommand.description =
	"provide additional data and receive signals from browser clients";

export default serveClientsSubcommand as Subcommand;
