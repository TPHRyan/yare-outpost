import { take } from "rxjs";

import { createLogger } from "../logger";
import { getMockHttpClient } from "../net/http.mocks";
import { FakeWebSocketFactory, getFakeWebSocketFactory } from "../net/ws.mocks";

import { Server, ServerServices } from "./server";
import { UserSession } from "./session";

type UserSessionResponse = Omit<UserSession, "session_id"> & {
	data: UserSession["session_id"];
};

const username = "city";
const password = "H60L2Y6OL2Ih8eON";
const fakeSession = {
	user_id: username,
	session_id: "45AUASfOl94",
};
const fakeSessionResponse: UserSessionResponse = {
	user_id: fakeSession.user_id,
	data: fakeSession.session_id,
};
const fakeGameId = "Sk3myr3l6TCb01";
const fakeGameServer = "FEzJ";

function getHttpWithLoginResponse(response: UserSession | UserSessionResponse) {
	const http = getMockHttpClient();
	http.post.mockReturnValue(response);
	return http;
}

type TestServices = ServerServices & {
	wsFactory: FakeWebSocketFactory;
};

function getServices(overrides: Partial<TestServices> = {}): TestServices {
	const logger = createLogger();
	logger.disableAll();
	return {
		http: overrides.http ?? getMockHttpClient(),
		logger,
		wsFactory: overrides.wsFactory ?? getFakeWebSocketFactory(),
	};
}

describe("yare server", () => {
	test("should successfully initialize", () => {
		const server = new Server({}, getServices());
		expect(server).toBeInstanceOf(Server);
	});

	test("should be able to login", async () => {
		const http = getHttpWithLoginResponse(fakeSessionResponse);
		const server = new Server({}, getServices({ http }));

		const userSession = await server.login(username, password);

		expect(userSession).toMatchObject(fakeSession);
		expect(http.post).toHaveBeenCalledWith(expect.anything(), {
			user_name: username,
			password,
		});
	});

	test("should be able to fetch game ids when no data property exists", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new Server({}, getServices({ http }));
		await server.login(username, password);

		http.get.mockReturnValue({});
		const games = await server.fetchGames();
		expect(games).toHaveLength(0);
	});

	test("should be able to fetch game ids when they exist", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new Server({}, getServices({ http }));
		await server.login(username, password);

		http.get.mockReturnValue({
			data: [
				{
					id: fakeGameId,
					server: fakeGameServer,
				},
			],
		});

		const games = await server.fetchGames();
		expect(games).toHaveLength(1);
		expect(games[0].id).toBe(fakeGameId);
	});

	test("should throw an error if an invalid response is given", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new Server({}, getServices({ http }));
		await server.login(username, password);

		return expect(async () => await server.fetchGames()).rejects.toThrow();
	});

	test("should be able to logout", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new Server({}, getServices({ http }));
		await server.login(username, password);

		await server.logout();
	});

	test("should return valid message$", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const services = getServices({ http });
		const server = new Server({}, services);
		await server.login(username, password);

		http.post.mockReturnValue({ data: "finished" });
		await server.fetchGameInfo(fakeGameId);

		const fakeMessageObject = {
			decay: "IeoRSCBexT7S",
		};

		return new Promise<void>((resolve) => {
			server.game(fakeGameId).message$.subscribe((message) => {
				expect(message).toMatchObject(fakeMessageObject);
				resolve();
			});

			services.wsFactory.sockets$
				.pipe(take(1))
				.subscribe((messageSocket) =>
					messageSocket.message$.next(
						JSON.stringify(fakeMessageObject),
					),
				);
		});
	});

	test("should accept sent code", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const services = getServices({ http });
		const server = new Server({}, services);
		await server.login(username, password);

		http.post.mockReturnValue({ data: "finished" });
		await server.fetchGameInfo(fakeGameId);

		const codeToSend = "cScB6kxTQwh31H3yf07vv2xu0zu6J16V1e2Vg";

		return new Promise<void>((resolve) => {
			services.wsFactory.sockets$.pipe(take(1)).subscribe((codeSocket) =>
				codeSocket.send$.subscribe((codeRequest) => {
					expect(typeof codeRequest).toBe("string");
					const parsedRequest = JSON.parse(codeRequest);
					expect(typeof parsedRequest).toBe("object");
					expect(parsedRequest).not.toBeNull();
					expect(parsedRequest).toMatchObject({
						u_code: codeToSend,
						u_id: fakeSession.user_id,
						session_id: fakeSession.session_id,
					});
					resolve();
				}),
			);

			server.game(fakeGameId).sendCode(codeToSend).then();
		});
	});
});
