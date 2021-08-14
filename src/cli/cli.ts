import { configure } from "../config";
import { EarlyCliContext } from "./cli-context.model";
import { Subcommand, Subcommands } from "./subcommand";

async function runSubcommand<C extends string>(
	ctx: EarlyCliContext,
	subcommand: Subcommand<C>,
): Promise<void> {
	return subcommand([], {
		...ctx,
		config: await configure(
			{
				domain: "yare.io",
			},
			ctx,
		),
	});
}

export class UnknownCommandError extends Error {}

export function outpost<C extends string>(
	ctx: EarlyCliContext,
	subcommands: Subcommands<C>,
): void {
	ctx.logger.setLevel("debug");

	const chosenCommand = "sync-code";
	const subcommand = subcommands[chosenCommand];
	if (undefined === subcommand) {
		throw new UnknownCommandError(
			`Command "${chosenCommand}" does not exist!`,
		);
	}
	runSubcommand(ctx, subcommand)
		.then()
		.catch((reason) => {
			throw reason;
		});
}
