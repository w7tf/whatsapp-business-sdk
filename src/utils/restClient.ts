import ky, { Options } from 'ky';

interface RestClientParams {
	baseURL?: string;
	apiToken?: string;
	errorHandler?: (error: any) => any;
}

export const createRestClient = ({ baseURL, apiToken, errorHandler }: RestClientParams) => {
	const fetch = ky.create({
		prefixUrl: baseURL,
		headers: {
			authorization: `Bearer ${apiToken}`,
		},
		hooks: {
			afterResponse: [
				async (_request: Request, _options: Options, response: Response) => {
					if (!response.ok && errorHandler) {
						const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
						(error as any).response = response;
						await errorHandler(error);
					}
					return response;
				}
			]
		}
	});

	return {
		fetch,
		get: async <Response = any, Params = Record<string, string>>(
			endpoint: string,
			params?: Params,
			config?: Options & { baseURL?: string; responseType?: string }
		) => {
			const { baseURL: configBaseURL, responseType, ...kyOptions } = config || {};
			const url = configBaseURL ? new URL(endpoint, configBaseURL).toString() : endpoint;
			
			const response = await (configBaseURL ? ky.get(url, {
				searchParams: params as Record<string, string | number | boolean>,
				...kyOptions
			}) : fetch.get(endpoint, { 
				searchParams: params as Record<string, string | number | boolean>,
				...kyOptions 
			}));
			
			if (responseType === "stream") {
				return response.body as any;
			}
			if (responseType === "arraybuffer") {
				return response.arrayBuffer() as any;
			}
			return response.json() as Promise<Response>;
		},
		post: async <Response = any, Payload = Record<string, any>>(
			endpoint: string,
			payload?: Payload,
			config?: Options
		) => {
			const response = await fetch.post(endpoint, { 
				json: payload,
				...config 
			});
			return response.json() as Promise<Response>;
		},
		put: async <Response = any, Payload = Record<string, any>>(
			endpoint: string,
			payload?: Payload,
			config?: Options
		) => {
			const response = await fetch.put(endpoint, { 
				json: payload,
				...config 
			});
			return response.json() as Promise<Response>;
		},
		delete: async <Response = any, Params = Record<string, any>>(
			endpoint: string,
			params?: Params,
			config?: Options
		) => {
			const response = await fetch.delete(endpoint, { 
				searchParams: params as Record<string, string | number | boolean>,
				...config 
			});
			return response.json() as Promise<Response>;
		},
	};
};
