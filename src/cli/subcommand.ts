import { CliContext } from "./cli-context.model";

export type SubcommandArgs = unknown[] | Record<string, unknown>;

export interface Subcommand<Args extends SubcommandArgs = SubcommandArgs> {
	commandName: string;
	description?: string;

	(ctx: CliContext, args?: Args): Promise<void>;
}

export interface Subcommands {
	[key: string]: Subcommand;
}
