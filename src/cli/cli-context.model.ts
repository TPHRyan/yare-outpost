import tty from "tty";

import { Observable } from "rxjs";
import { OutpostRuntimeConfig } from "../config";
import { EventStream } from "../events";
import { Logger } from "../logger";

export interface EarlyCliContext {
	events$: Readonly<EventStream>;
	logger: Readonly<Logger>;
	stdout: Readonly<tty.WriteStream>;
	stdin: Readonly<tty.ReadStream>;
	stop: Readonly<Promise<void>>;
}

export interface CliContext<Domain extends string = string>
	extends EarlyCliContext {
	code$: Readonly<Observable<string>>;
	config: Readonly<OutpostRuntimeConfig<Domain>>;
}
