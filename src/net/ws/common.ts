import { Observable, Subject } from "rxjs";
import WebSocketImpl from "ws";

type WebSocketData = Exclude<WebSocketImpl.Data, ArrayBuffer>;

interface WebSocket {
	message$: Observable<WebSocketData>;
	closed: Promise<void>;

	send(data: unknown): Promise<void>;

	close(code?: number, data?: string): void;
}

function createMessageSubject(
	webSocket: WebSocketImpl,
): Subject<WebSocketData> {
	const messageSubject: Subject<WebSocketData> = new Subject();
	webSocket.on("message", (data: WebSocketData) => messageSubject.next(data));
	return messageSubject;
}

function createMessageObservable(
	webSocket: WebSocketImpl,
): Observable<WebSocketData> {
	let messageSubject: Subject<WebSocketData> | null = null;
	return new Observable<WebSocketData>((subscriber) => {
		if (null === messageSubject) {
			messageSubject = createMessageSubject(webSocket);
		}
		messageSubject.subscribe(subscriber);
	});
}

export { createMessageObservable, WebSocket, WebSocketData };
