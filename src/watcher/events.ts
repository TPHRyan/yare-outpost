import { Event } from "../events";

export type CodeChangedEvent = Event<
	"codeChanged",
	{
		code: string;
	}
>;
