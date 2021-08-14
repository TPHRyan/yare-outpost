import { CliContext } from "./cli-context.model";
import { Subcommand } from "./subcommand";
import syncCode from "./sync-code.subcommand";

const startSubcommand = async (
	ctx: CliContext,
	_args: string[] = [],
): Promise<void> => {
	await Promise.all([syncCode(ctx)]);
};
startSubcommand.commandName = "start";
startSubcommand.description = "start (by default) all available services";

export default startSubcommand as Subcommand;
