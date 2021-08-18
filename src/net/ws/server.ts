import util from "util";
import { Observable, Subject } from "rxjs";
import { Server } from "ws";

import { createMessageObservable, WebSocket } from "./common";

export interface WebSocketServer {
	connection$: Observable<WebSocket>;
	port: number;
	closed: Promise<void>;

	close(): void;
}

export function createServer(port: number = 8080): WebSocketServer {
	const server = new Server({
		port,
	});
	const connection$ = new Subject<WebSocket>();
	server.on("connection", (webSocket): void => {
		connection$.next({
			message$: createMessageObservable(webSocket),
			send: util.promisify<unknown, void>(
				(data: unknown, cb?: (err?: Error) => void) => {
					webSocket.send(JSON.stringify(data), cb);
				},
			),
			close: (code, data) => webSocket.close(code, data),
			closed: new Promise<void>((resolve) =>
				webSocket.on("close", () => resolve()),
			),
		});
	});
	return {
		connection$,
		port,
		closed: new Promise((resolve) => server.on("close", () => resolve())),
		close: () => server.close(),
	};
}
