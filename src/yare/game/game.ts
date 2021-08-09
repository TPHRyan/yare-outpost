import { Buffer } from "buffer";

import { concatMap, from, map, Observable, of } from "rxjs";

import { WebSocket } from "../../net/ws";
import { GameData } from "./game-data.model";

export interface Game {
	id: string;
	message$: Observable<GameData>;

	close(): Promise<void>;
}

interface GameProxy extends Partial<Game> {
	id: string;
	_webSocket?: WebSocket;
}

export type GameWebSocketFactory = (gameId: string) => WebSocket;

export function getLazyGamesFromGameIds(
	gameIds: string[],
	ws: GameWebSocketFactory,
): Record<string, Game> {
	return Object.fromEntries(
		gameIds.map((gameId: string): [string, Game] => [
			gameId,
			createGameProxy(gameId, ws),
		]),
	);
}

export function createGameProxy(
	gameId: string,
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
				}
				return target[key];
			},
		},
	) as Game;
}

function initGameSocket(
	target: GameProxy,
	ws: GameWebSocketFactory,
): GameProxy & { _webSocket: WebSocket } {
	return undefined === target._webSocket
		? {
				...target,
				_webSocket: ws(target.id),
		  }
		: (target as GameProxy & { _webSocket: WebSocket });
}

function createMessageObservable(
	target: GameProxy & { _webSocket: WebSocket },
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
