import tty from "tty";

import { OutpostRuntimeConfig } from "../config";
import { EventStream } from "../events";
import { Logger } from "../logger";

export interface EarlyCliContext {
	events$: EventStream;
	logger: Logger;
	stdout: tty.WriteStream;
	stdin: tty.ReadStream;
	stop: Promise<void>;
}

export interface CliContext<Domain extends string = string>
	extends EarlyCliContext {
	config: OutpostRuntimeConfig<Domain>;
}
