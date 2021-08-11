import { Observable, ReplaySubject, Subject } from "rxjs";

import { WebSocket, WebSocketData, WebSocketFactory } from "./ws";

export interface FakeWebSocket extends WebSocket {
	message$: Subject<WebSocketData>;

	send$: Observable<string>;
}

export interface FakeWebSocketFactory extends WebSocketFactory {
	sockets$: Observable<FakeWebSocket>;
}

export function getFakeWebSocketFactory(): FakeWebSocketFactory {
	const sockets$ = new ReplaySubject<FakeWebSocket>();
	const factory = (): FakeWebSocket => {
		const message$ = new Subject<WebSocketData>();
		const send$ = new Subject<string>();
		let resolve: (() => void) | null = null;
		const close = (_code?: number, _data?: string) => {
			if (resolve) {
				resolve();
			}
		};
		const closed = new Promise<void>((res) => {
			resolve = res;
		});
		const socket = {
			message$,
			close,
			closed,
			async send(data: unknown): Promise<void> {
				send$.next(JSON.stringify(data));
			},
			send$,
		};
		sockets$.next(socket);
		return socket;
	};
	factory.sockets$ = sockets$;
	return factory;
}
