import process from "process";
import readline from "readline";
import util from "util";

import { ServerConfig as YareServerConfig } from "./yare/server";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
const question = util.promisify(
	(query: string, callback: (err: unknown, answer: string) => void) =>
		rl.question(query, (answer: string) => callback(undefined, answer)),
);

export interface OutpostConfig<Domain extends string, Server extends string>
	extends YareServerConfig<Domain, Server> {
	username: string;
	password: string;
}

export interface ConnectionConfig<
	Domain extends string,
	Server extends string,
> {
	domain: Domain;
	server: Server;
}

export async function configure<Domain extends string, Server extends string>(
	connectionConfig: ConnectionConfig<Domain, Server>,
): Promise<OutpostConfig<Domain, Server>> {
	const username = await question("Enter your username: ");
	// TODO: Replace this with something else.
	//  Don't really want to accept password outside of .env or a secret
	const password = await question("Enter your password: ");
	return {
		...connectionConfig,
		username,
		password,
	};
}
