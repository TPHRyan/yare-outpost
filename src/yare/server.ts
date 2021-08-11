import chalk from "chalk";

import { throwIfError } from "../local-util";
import { createLogger, Logger } from "../logger";
import { HttpClient } from "../net/http";
import { WebSocketFactory } from "../net/ws";

import {
	createGameProxy,
	GameWebSocketFactory,
	getLazyGamesFromGameIds,
	Game,
	GameInfo,
	NotFoundGameInfo,
} from "./game";
import { GameIdsFromServer } from "./response-models";
import { UserSession } from "./session";

interface ServerConfig<Domain extends string> {
	domain?: Domain;
	logger?: Logger;
}

type FullConfig<D extends string> = Required<ServerConfig<D>>;

const defaultConfig: Readonly<FullConfig<"yare.io">> = {
	domain: "yare.io",
	logger: createLogger("yare-server"),
};

interface ServerServices {
	http: HttpClient;
	wsFactory: WebSocketFactory;
}

type YareHttpUrl<D extends string> = `https://${D}`;
type YareHttpEndpoint<
	D extends string,
	E extends string,
> = `${YareHttpUrl<D>}/${E}`;
type YareWssEndpoint<D extends string, E extends string> = `wss://${D}/d1/${E}`;

function checkIsValidSession(
	session: UserSession | null,
): asserts session is UserSession {
	if (null === session) {
		throw new Error("Not logged in to server!");
	}
}

export class Server<Domain extends string> {
	public readonly domain: Domain;
	public readonly server: "d1";

	private readonly http: HttpClient;
	private readonly gameWsFactory: GameWebSocketFactory;
	private readonly logger: Logger;

	private _games: Record<string, Game> = {};
	private session: UserSession | null = null;

	constructor(config: ServerConfig<Domain> = {}, services: ServerServices) {
		const mergedConfig: FullConfig<Domain> = Object.assign(
			defaultConfig,
			config,
		);
		this.domain = mergedConfig.domain;
		this.server = "d1";

		this.http = services.http;
		this.gameWsFactory = (gameId: string) =>
			services.wsFactory(this.getWssEndpoint(gameId));
		this.logger = mergedConfig.logger;
	}

	async login(username: string, password: string): Promise<UserSession> {
		if (this.session) {
			this.logger.warn(
				"WARNING: Session already exists for this server! These details will be overwritten.",
			);
		}

		let returnedSession: unknown;
		try {
			returnedSession = await this.http.post(
				this.getHttpEndpoint("validate"),
				{
					user_name: username,
					password,
				},
			);
		} catch (e) {
			throw Error(`Couldn't log in: ${e.message ?? "Reason unknown"}`);
		}

		const session = throwIfError(UserSession.decode(returnedSession));

		if (session.user_id === username) {
			this.session = session;
			return session;
		} else {
			throw Error("Couldn't log in: Session user did not match!");
		}
	}

	async logout(): Promise<void> {
		const promises: Promise<void>[] = [];
		for (const game of Object.values(this._games)) {
			promises.push(game.close());
		}
		this.session = null;
		await Promise.all(promises);
	}

	async onDisconnect(): Promise<string> {
		this.logger.info(
			chalk.yellowBright("Received notice to terminate, logging out..."),
		);
		await this.logout();
		this.logger.info("Logged out!");
		return "Server closed.";
	}

	async fetchGames(): Promise<Readonly<Game[]>> {
		checkIsValidSession(this.session);
		const result = await this.http.get(
			this.getHttpEndpoint(`active-games/${this.session.user_id}`),
		);
		const gameIds = throwIfError(GameIdsFromServer.decode(result));
		this._games = getLazyGamesFromGameIds(
			gameIds,
			this.session,
			this.gameWsFactory,
		);
		return this.games;
	}

	async fetchGameInfo(gameId: string): Promise<Readonly<GameInfo> | null> {
		checkIsValidSession(this.session);
		const result = await this.http.post<GameInfo | NotFoundGameInfo>(
			this.getHttpEndpoint(`gameinfo`),
			{
				game_id: gameId,
				session_id: this.session.session_id,
			},
		);
		if (undefined === result?.data || "no game found" === result?.data) {
			return null;
		} else {
			this._games[gameId] = createGameProxy(
				gameId,
				this.session,
				this.gameWsFactory,
			);
			return result;
		}
	}

	get games(): Game[] {
		return Object.values(this._games);
	}

	game(gameId: string): Game {
		if (!this._games[gameId]) {
			throw new Error(
				`Game with id "${gameId}" not found!\n` +
					"Have you called fetchGames() or fetchGameInfo() already?",
			);
		}
		return this._games[gameId];
	}

	private getBaseHttpUrl(): YareHttpUrl<Domain> {
		return `https://${this.domain}`;
	}

	private getHttpEndpoint<Endpoint extends string>(
		endpoint: Endpoint,
	): YareHttpEndpoint<Domain, Endpoint> {
		const baseUrl = this.getBaseHttpUrl();
		return `${baseUrl}/${endpoint}`;
	}

	private getWssEndpoint<Endpoint extends string>(
		endpoint: Endpoint,
	): YareWssEndpoint<Domain, Endpoint> {
		return `wss://${this.domain}/${this.server}/${endpoint}`;
	}
}

export { ServerConfig, ServerServices };
