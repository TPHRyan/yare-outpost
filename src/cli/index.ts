import { Subcommands } from "./subcommand";
import syncCode from "./sync-code.subcommand";

const defaultSubcommands: Subcommands = {
	"sync-code": syncCode,
};

export { outpost, UnknownCommandError } from "./cli";
export { Subcommand } from "./subcommand";

export { defaultSubcommands, syncCode };