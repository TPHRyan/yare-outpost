import util from "util";

import WebSocketImpl from "ws";

import { createMessageObservable, WebSocket } from "./common";

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
	return {
		message$: createMessageObservable(webSocket),
		send: util.promisify<unknown, void>(
			(data: unknown, cb?: (err?: Error) => void) => {
				const jsonData = JSON.stringify(data);
				if (webSocket.readyState === WebSocketImpl.CONNECTING) {
					webSocket.on("open", () => webSocket.send(jsonData, cb));
				} else {
					webSocket.send(jsonData, cb);
				}
			},
		),
		close: (code, data) => webSocket.close(code, data),
		closed: new Promise<void>((resolve) =>
			webSocket.on("close", () => resolve()),
		),
	};
}

export type WebSocketFactory = (
	url: string,
	headers?: Record<string, string>,
) => WebSocket;

export const createWebSocket: WebSocketFactory = _createWebSocket;
