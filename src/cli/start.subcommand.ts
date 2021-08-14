import { CliContext } from "./cli-context.model";
import { Subcommand } from "./subcommand";
import syncCode from "./sync-code.subcommand";

const startSubcommand = async (
	args: string[],
	ctx: CliContext,
): Promise<void> => {
	await Promise.all([syncCode([], ctx)]);
};
startSubcommand.commandName = "start";

export default startSubcommand as Subcommand<"start">;
