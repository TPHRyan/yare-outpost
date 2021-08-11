import { Buffer } from "buffer";

import { concatMap, from, map, Observable, of } from "rxjs";

import { WebSocket } from "../../net/ws";
import type { UserSession } from "../session";

import { GameData } from "./game-data.model";
import { GameMetadata } from "./game-metadata.model";

interface Game {
	id: string;
	metadata: GameMetadata;
	message$: Observable<GameData>;

	sendCode(code: string): Promise<void>;

	close(): Promise<void>;
}

interface GameProxy extends Partial<Game> {
	id: string;
	metadata: GameMetadata;
	_webSocket?: WebSocket;
}

type GameWebSocketFactory = (
	gameId: string,
	metadata: GameMetadata,
) => WebSocket;

type GameProxyWithSocket = GameProxy & { _webSocket: WebSocket };

function initGameSocket(
	target: GameProxy,
	ws: GameWebSocketFactory,
): GameProxyWithSocket {
	return undefined === target._webSocket
		? {
				...target,
				_webSocket: ws(target.id, target.metadata),
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

export function getLazyGamesFromMetadata(
	metadata: GameMetadata[],
	session: UserSession,
	ws: GameWebSocketFactory,
): Record<string, Game> {
	return Object.fromEntries(
		metadata.map((metadata: GameMetadata): [string, Game] => [
			metadata.id,
			createGameProxy(metadata.id, metadata, session, ws),
		]),
	);
}

export function createGameProxy(
	gameId: string,
	metadata: GameMetadata,
	session: UserSession,
	ws: GameWebSocketFactory,
): Game {
	return new Proxy<GameProxy>(
		{
			id: gameId,
			metadata,
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

export { Game, GameWebSocketFactory };
