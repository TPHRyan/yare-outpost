import { CliContext, Subcommand } from "./cli";
import syncCode from "./sync-code";

const startSubcommand = async (
	ctx: CliContext,
	_args: string[] = [],
): Promise<void> => {
	await Promise.all([syncCode(ctx)]);
};
startSubcommand.commandName = "start";
startSubcommand.description = "start (by default) all available services";

export default startSubcommand as Subcommand;
