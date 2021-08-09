import { take } from "rxjs";

import { getMockHttpClient } from "../net/http.mocks";
import { FakeWebSocketFactory, getFakeWebSocketFactory } from "../net/ws.mocks";

import { Server, ServerServices } from "./server";
import { UserSession } from "./session";

const username = "city";
const password = "H60L2Y6OL2Ih8eON";
const fakeSession = {
	user_id: username,
	session_id: "45AUASfOl94",
};

function getHttpWithLoginResponse(fakeSession: UserSession) {
	const http = getMockHttpClient();
	http.post.mockReturnValue(fakeSession);
	return http;
}

type TestServices<WSSendData = unknown> = ServerServices & {
	wsFactory: FakeWebSocketFactory<WSSendData>;
};

function getServices<WSSendData = unknown>(
	overrides: Partial<TestServices> = {},
): TestServices {
	return {
		http: overrides.http ?? getMockHttpClient(),
		wsFactory: overrides.wsFactory ?? getFakeWebSocketFactory<WSSendData>(),
	};
}

describe("yare server", () => {
	test("should successfully initialize", () => {
		const server = new Server({}, getServices());
		expect(server).toBeInstanceOf(Server);
	});

	test("should be able to login", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
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

		const fakeGameId = "Sk3myr3l6TCb01";
		http.get.mockReturnValue({ data: [fakeGameId] });

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

		const fakeGameId = "Sk3myr3l6TCb01";
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
});
