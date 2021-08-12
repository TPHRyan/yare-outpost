import start from "./start.subcommand";
import { Subcommands } from "./subcommand";

const defaultSubcommands: Subcommands = {
	start,
};

export { outpost, UnknownCommandError } from "./cli";
export { Subcommand } from "./subcommand";

export { defaultSubcommands, start };
