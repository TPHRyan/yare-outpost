import { CliContext } from "./cli-context.model";

interface Subcommand<Name extends string, Args extends string[] = string[]> {
	commandName: Name;

	(args: Args, ctx: CliContext): Promise<void>;
}

interface _Subcommands {
	[key: string]: Subcommand<string> | undefined;
}

type Subcommands<Name extends string = string> = {
	[K in Name]: Subcommand<Name>;
} &
	_Subcommands;

export { Subcommand, Subcommands };
