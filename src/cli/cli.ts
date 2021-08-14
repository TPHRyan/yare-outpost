import { configure } from "../config";
import { EarlyCliContext } from "./cli-context.model";
import { Subcommand, SubcommandArgs } from "./subcommand";

async function runSubcommand<Args extends SubcommandArgs>(
	args: Args,
	ctx: EarlyCliContext,
	subcommand: Subcommand<Args>,
): Promise<void> {
	return subcommand(
		{
			...ctx,
			config: await configure(
				{
					domain: "yare.io",
				},
				ctx,
			),
		},
		args,
	);
}

export class UnknownCommandError extends Error {}

export function outpost<Args extends SubcommandArgs>(
	args: Args,
	ctx: EarlyCliContext,
	subcommand: Subcommand<Args>,
): void {
	runSubcommand(args, ctx, subcommand)
		.then()
		.catch((reason) => {
			throw reason;
		});
}
