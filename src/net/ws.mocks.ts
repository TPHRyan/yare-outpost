import { Observable, ReplaySubject, Subject } from "rxjs";

import { WebSocket, WebSocketData, WebSocketFactory } from "./ws";

export interface FakeWebSocket<SendData = unknown> extends WebSocket {
	message$: Subject<WebSocketData>;

	send$: Observable<SendData>;
}

export interface FakeWebSocketFactory<SendData = unknown>
	extends WebSocketFactory {
	sockets$: Observable<FakeWebSocket<SendData>>;
}

export function getFakeWebSocketFactory<
	SendData = unknown,
>(): FakeWebSocketFactory<SendData> {
	const sockets$ = new ReplaySubject<FakeWebSocket<SendData>>();
	const factory = (): FakeWebSocket => {
		const message$ = new Subject<WebSocketData>();
		const send$ = new Subject<SendData>();
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
				send$.next(data as SendData);
			},
			send$,
		};
		sockets$.next(socket);
		return socket;
	};
	factory.sockets$ = sockets$;
	return factory;
}
