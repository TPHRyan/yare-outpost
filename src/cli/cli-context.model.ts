import tty from "tty";

import { OutpostRuntimeConfig } from "../config";
import { Logger } from "../logger";

export interface EarlyCliContext {
	logger: Logger;
	stdout: tty.WriteStream;
	stdin: tty.ReadStream;
	stop: Promise<void>;
}

export interface CliContext<Domain extends string = string>
	extends EarlyCliContext {
	config: OutpostRuntimeConfig<Domain>;
}
