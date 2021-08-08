import { Buffer } from "buffer";
import { concatMap, from, map, Observable, of } from "rxjs";

import { throwIfError } from "../local-util";
import { HttpClient } from "../net/http";
import { WebSocket, WebSocketFactory } from "../net/ws";

import { UserSession } from "./session";
import { GameIdsFromServer } from "./response-models";

export interface YareServerConfig<
	Domain extends string,
	Server extends string,
> {
	domain?: Domain;
	server?: Server;
}

type FullConfig<D extends string, S extends string> = Required<
	YareServerConfig<D, S>
>;

const defaultConfig: Readonly<FullConfig<"yare.io", "d1">> = {
	domain: "yare.io",
	server: "d1",
};

export interface YareServerServices {
	http: HttpClient;
	wsFactory: WebSocketFactory;
}

type YareHttpUrl<D extends string> = `https://${D}`;
type YareHttpEndpoint<
	D extends string,
	E extends string,
> = `${YareHttpUrl<D>}/${E}`;
type YareWssEndpoint<
	D extends string,
	S extends string,
	E extends string,
> = `wss://${D}/${S}/${E}`;

export class YareServer<Domain extends string, Server extends string> {
	private readonly domain: Domain;
	private readonly server: Server;
	private session?: UserSession;

	private readonly http: HttpClient;
	private readonly wsFactory: WebSocketFactory;

	private gameSockets: Record<string, WebSocket> = {};

	private readonly errorNoSession = new Error("Not logged in to server!");

	constructor(
		config: YareServerConfig<Domain, Server> = {},
		services: YareServerServices,
	) {
		const mergedConfig: FullConfig<Domain, Server> = Object.assign(
			defaultConfig,
			config,
		);
		this.domain = mergedConfig.domain;
		this.server = mergedConfig.server;

		this.http = services.http;
		this.wsFactory = services.wsFactory;
	}

	private initWebSocketFor(gameId: string): WebSocket {
		if (!this.gameSockets[gameId]) {
			this.gameSockets[gameId] = this.wsFactory(
				this.getWssEndpoint(gameId),
			);
		}
		return this.gameSockets[gameId];
	}

	async login(username: string, password: string): Promise<UserSession> {
		if (this.session) {
			console.warn(
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
		for (const ws of Object.values(this.gameSockets)) {
			promises.push(ws.closed);
			ws.close();
		}
		this.session = undefined;
		await Promise.all(promises);
	}

	async fetchGameIds(): Promise<string[]> {
		if (!this.session) {
			throw this.errorNoSession;
		}
		const result = await this.http.get(
			this.getHttpEndpoint(`active-games/${this.session.user_id}`),
		);
		return throwIfError(GameIdsFromServer.decode(result));
	}

	message$(gameId: string): Observable<Record<string, unknown> | unknown[]> {
		const gameSocket = this.initWebSocketFor(gameId);
		return gameSocket.message$.pipe(
			concatMap((data) => (Array.isArray(data) ? from(data) : of(data))),
			map((data): string =>
				Buffer.isBuffer(data) ? data.toString("utf-8") : data,
			),
			map((jsonString) => JSON.parse(jsonString)),
		);
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
	): YareWssEndpoint<Domain, Server, Endpoint> {
		return `wss://${this.domain}/${this.server}/${endpoint}`;
	}
}
