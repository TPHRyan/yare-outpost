import { Buffer } from "buffer";

import { concatMap, from, map, Observable, of } from "rxjs";

import { WebSocket } from "../../net/ws";
import type { UserSession } from "../session";

import { GameData } from "./game-data.model";

export interface Game {
	id: string;
	message$: Observable<GameData>;

	sendCode(code: string): Promise<void>;

	close(): Promise<void>;
}

interface GameProxy extends Partial<Game> {
	id: string;
	_webSocket?: WebSocket;
}

export type GameWebSocketFactory = (gameId: string) => WebSocket;

export function getLazyGamesFromGameIds(
	gameIds: string[],
	session: UserSession,
	ws: GameWebSocketFactory,
): Record<string, Game> {
	return Object.fromEntries(
		gameIds.map((gameId: string): [string, Game] => [
			gameId,
			createGameProxy(gameId, session, ws),
		]),
	);
}

export function createGameProxy(
	gameId: string,
	session: UserSession,
	ws: GameWebSocketFactory,
): Game {
	return new Proxy<GameProxy>(
		{
			id: gameId,
			async close() {
				if (this._webSocket) {
					await this._webSocket.close();
				}
			},
		},
		{
			get<K extends keyof Game>(target: GameProxy, key: K) {
				if (undefined !== target[key]) {
					return target[key];
				}
				switch (key) {
					case "message$":
						target.message$ = createMessageObservable(
							initGameSocket(target, ws),
						);
						break;
					case "sendCode":
						target.sendCode = createSendCodeFunction(
							initGameSocket(target, ws),
							session,
						);
				}
				return target[key];
			},
		},
	) as Game;
}

type GameProxyWithSocket = GameProxy & { _webSocket: WebSocket };

function initGameSocket(
	target: GameProxy,
	ws: GameWebSocketFactory,
): GameProxyWithSocket {
	return undefined === target._webSocket
		? {
				...target,
				_webSocket: ws(target.id),
		  }
		: (target as GameProxyWithSocket);
}

function createMessageObservable(
	target: GameProxyWithSocket,
): Observable<GameData> {
	return target._webSocket.message$.pipe(
		concatMap((data) => {
			return Array.isArray(data) ? from(data) : of(data);
		}),
		map((data): string =>
			Buffer.isBuffer(data) ? data.toString("utf-8") : data,
		),
		map((jsonString) => JSON.parse(jsonString)),
	);
}

function createSendCodeFunction(
	target: GameProxyWithSocket,
	session: UserSession,
): (code: string) => Promise<void> {
	return (code: string): Promise<void> =>
		target._webSocket.send({
			u_code: code,
			u_id: session.user_id,
			session_id: session.session_id,
		});
}
