import {
	getLogger,
	Logger as LoglevelLogger,
	LogLevel as _Loglevel,
} from "loglevel";

export type Logger = LoglevelLogger;
export type LogLevel = _Loglevel;

export function createLogger(name: string = "main"): Logger {
	return getLogger(name);
}
