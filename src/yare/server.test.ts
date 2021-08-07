import { getMockHttpClient } from "../net/http.mocks";

import { YareServer } from "./server";
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

describe("yare server", () => {
	test("should successfully initialize", () => {
		const server = new YareServer({}, getMockHttpClient());
		expect(server).toBeInstanceOf(YareServer);
	});

	test("should be able to login", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new YareServer({}, http);

		const userSession = await server.login(username, password);

		expect(userSession).toMatchObject(fakeSession);
		expect(http.post).toHaveBeenCalledWith(expect.anything(), {
			user_name: username,
			password,
		});
	});

	test("should be able to fetch game ids when no data property exists", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new YareServer({}, http);
		await server.login(username, password);

		http.get.mockReturnValue({});
		const gameIds = await server.fetchGameIds();
		expect(gameIds).toHaveLength(0);
	});

	test("should be able to fetch game ids when they exist", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new YareServer({}, http);
		await server.login(username, password);

		const fakeGameId = "Sk3myr3l6TCb01";
		http.get.mockReturnValue({ data: [fakeGameId] });

		const gameIds = await server.fetchGameIds();
		expect(gameIds).toHaveLength(1);
		expect(gameIds[0]).toBe(fakeGameId);
	});

	test("should throw an error if an invalid response is given", async () => {
		const http = getHttpWithLoginResponse(fakeSession);
		const server = new YareServer({}, http);
		await server.login(username, password);

		return expect(
			async () => await server.fetchGameIds(),
		).rejects.toThrow();
	});
});
