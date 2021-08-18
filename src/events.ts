import { filter, Subject, Subscriber, Subscription } from "rxjs";

interface Event<
	Type extends string,
	Payload extends Record<string, unknown> = Record<string, unknown>,
> {
	type: Type;
	payload: Payload;
}

class EventSubject extends Subject<Event<string>> {
	subscribeTo<E extends Event<string>>(
		eventType: E["type"],
		observer: Partial<Subscriber<E>>,
	): Subscription {
		return super
			.pipe(filter((event): event is E => eventType === event.type))
			.subscribe(observer);
	}
}

export type EventStream = EventSubject;

export function createEventStream(): EventStream {
	return new EventSubject();
}

export { Event };
