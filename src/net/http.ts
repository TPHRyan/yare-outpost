import axios from "axios";

export interface HttpClient<BaseUrl extends string = ""> {
	readonly baseUrl: BaseUrl;

	get<T = unknown>(
		url: string,
		parameters?: Record<string, string>,
	): Promise<T>;

	post<T = unknown>(url: string, body?: unknown): Promise<T>;
}

export function getHttpClient(): HttpClient;
export function getHttpClient<BaseUrl extends string>(
	baseUrl: string,
): HttpClient<BaseUrl>;
export function getHttpClient(baseUrl: string = ""): HttpClient<string> {
	function base<S extends string>(url: S): `${string}${S}` {
		return `${baseUrl}${url}`;
	}

	return {
		baseUrl,
		async get<T = unknown>(
			url: string,
			parameters?: Record<string, string>,
		): Promise<T> {
			const response = await axios.get<T>(base(url), {
				params: parameters,
			});
			return response.data;
		},
		async post<T = unknown>(url: string, body?: unknown): Promise<T> {
			const response = await axios.post<T>(base(url), body);
			return response.data;
		},
	};
}
