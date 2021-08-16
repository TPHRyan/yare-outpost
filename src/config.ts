import readline from "readline";
import util from "util";

import { EarlyCliContext } from "./cli";
import { ServerConfig as YareServerConfig } from "./yare/server";

interface QuestionFn {
	(query: string): Promise<string>;

	close(): void;
}

function makeQuestion(ctx: EarlyCliContext): QuestionFn {
	const rl = readline.createInterface({
		input: ctx.stdin,
		output: ctx.stdout,
	});
	const question: unknown = util.promisify(
		(query: string, callback: (err: unknown, answer: string) => void) =>
			rl.question(query, (answer: string) => callback(undefined, answer)),
	);
	(question as Record<string, unknown>).close = () => rl.close();
	return question as QuestionFn;
}

export interface UserCredentials {
	username: string;
	password: string;
}

export type OutpostConfig<Domain extends string> = YareServerConfig<Domain>;

export interface OutpostRuntimeConfig<Domain extends string>
	extends OutpostConfig<Domain> {
	getCredentials(): UserCredentials | Promise<UserCredentials>;
}

export async function configure<Domain extends string>(
	connectionConfig: OutpostConfig<Domain>,
	ctx: EarlyCliContext,
): Promise<OutpostRuntimeConfig<Domain>> {
	return {
		...connectionConfig,
		getCredentials: async (): Promise<UserCredentials> => {
			const question = makeQuestion(ctx);
			// TODO: Replace this with something else.
			//  Don't really want to accept password outside of .env or a secret
			const credentials = {
				username: await question("Enter your username: "),
				password: await question("Enter your password: "),
			};
			question.close();
			return credentials;
		},
	};
}
