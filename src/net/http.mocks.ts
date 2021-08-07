import { HttpClient } from "./http";

interface MockHttpClient {
	get: jest.Mock;
	post: jest.Mock;
}

export function getMockHttpClient(): HttpClient & MockHttpClient {
	return {
		baseUrl: "",
		get: jest.fn(),
		post: jest.fn(),
	};
}
