import { Buffer } from "buffer";

import axios, { AxiosResponse } from "axios";
import WebSocket from "ws";

import { throwIfError } from "../local-util";
import { UserSession } from "./session";

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

	private gameSockets: Record<string, WebSocket> = {};

	private readonly errorNoSession = new Error("Not logged in to server!");

	constructor(config: YareServerConfig<Domain, Server> = {}) {
		const mergedConfig: FullConfig<Domain, Server> = Object.assign(
			defaultConfig,
			config,
		);
		this.domain = mergedConfig.domain;
		this.server = mergedConfig.server;
	}

	async login(username: string, password: string): Promise<UserSession> {
		if (this.session) {
			console.warn(
				"WARNING: Session already exists for this server! These details will be overwritten.",
			);
		}
		const req: AxiosResponse<unknown> = await axios
			.post(this.getHttpEndpoint("validate"), {
				user_name: username,
				password,
			})
			.catch((e) => {
				throw Error(
					`Couldn't log in: ${e.message ?? "Reason unknown"}`,
				);
			});

		const session = throwIfError(UserSession.decode(req.data));

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
			promises.push(
				new Promise((resolve) => {
					ws.on("close", () => resolve());
				}),
			);
			ws.close();
		}
		this.session = undefined;
		await Promise.all(promises);
	}

	async fetchGameIds(): Promise<string[]> {
		if (!this.session) {
			throw this.errorNoSession;
		}
		const req = await axios.get(
			this.getHttpEndpoint(`active-games/${this.session.user_id}`),
		);
		if (req.data.data === "no active games") {
			return [];
		} else {
			return req.data.data;
		}
	}

	subscribe(
		gameId: string,
		event: "message" | "close",
		handler: (data: unknown) => void,
	): void {
		if (!this.gameSockets[gameId]) {
			this.gameSockets[gameId] = new WebSocket(
				this.getWssEndpoint(gameId),
				{
					headers: {
						"User-Agent":
							"yare-sync (https://github.com/swz-gh/yare-sync)",
					},
				},
			);
		}
		this.gameSockets[gameId].on(event, (ev: Buffer | undefined) => {
			let data = undefined;
			if (Buffer.isBuffer(ev)) {
				data = JSON.parse(ev.toString("utf-8"));
			}
			handler(data);
		});
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
