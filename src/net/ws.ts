import util from "util";

import { Observable, Subject } from "rxjs";
import WebSocketImpl from "ws";

function _createWebSocket(
	url: string,
	headers: Record<string, string> = {},
): WebSocket {
	const webSocket = new WebSocketImpl(url, {
		headers: {
			"User-Agent":
				"yare-outpost (https://github.com/TPHRyan/yare-outpost)",
			...headers,
		},
	});
	let messageSubject: Subject<WebSocketData> | null = null;
	const message$ = new Observable<WebSocketData>((subscriber) => {
		if (null === messageSubject) {
			messageSubject = createMessageSubject(webSocket);
		}
		messageSubject.subscribe(subscriber);
	});
	return {
		message$,
		send: util.promisify<unknown, void>(
			(data: unknown, cb?: (err?: Error) => void) => {
				if (webSocket.readyState === WebSocketImpl.CONNECTING) {
					webSocket.on("open", () => webSocket.send(data, cb));
				} else {
					webSocket.send(data, cb);
				}
			},
		),
		close: (code, data) => webSocket.close(code, data),
		closed: new Promise<void>((resolve) =>
			webSocket.on("close", () => resolve()),
		),
	};
}

function createMessageSubject(
	webSocket: WebSocketImpl,
): Subject<WebSocketData> {
	const messageSubject: Subject<WebSocketData> = new Subject();
	webSocket.on("message", (data: WebSocketData) => messageSubject.next(data));
	return messageSubject;
}

export type WebSocketData = Exclude<WebSocketImpl.Data, ArrayBuffer>;

export interface WebSocket {
	message$: Observable<WebSocketData>;

	send(data: unknown): Promise<void>;

	close(code?: number, data?: string): void;

	closed: Promise<void>;
}

export type WebSocketFactory = (
	url: string,
	headers?: Record<string, string>,
) => WebSocket;

export const createWebSocket: WebSocketFactory = _createWebSocket;
