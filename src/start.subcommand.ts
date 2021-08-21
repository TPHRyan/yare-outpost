import { CliContext, Subcommand } from "./cli";
import serveClients from "./serve-clients";
import syncCode from "./sync-code";

const startSubcommand = async (
	ctx: CliContext,
	_args: string[] = [],
): Promise<void> => {
	await Promise.all([serveClients(ctx), syncCode(ctx)]);
};
startSubcommand.commandName = "start";
startSubcommand.description = "start all available services";

export default startSubcommand as Subcommand;
