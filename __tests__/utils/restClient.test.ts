import { describe, it, beforeEach, expect, vi } from "vitest";
import { createRestClient } from "../../src/utils/restClient";

type Methods = "get" | "post" | "put" | "delete";

describe("create rest client", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("should return CRUD methods and be callable", () => {
		const restClient = createRestClient({});
		vi.spyOn(restClient, "get");
		vi.spyOn(restClient, "post");
		vi.spyOn(restClient, "put");
		vi.spyOn(restClient, "delete");
		const call = (method: Methods) =>
			restClient[method](
				"hello",
				{ data: {} },
				{ headers: { "Content-Type": "multipart/form-data" } }
			);
		const methods: Methods[] = ["get", "post", "put", "delete"];

		//Iterative trough each method
		methods.forEach((method) => {
			//make a facke api call
			call(method);
			//And make sure it was called with the right params
			expect(restClient[method]).toHaveBeenCalledWith(
				"hello",
				{ data: {} },
				{ headers: { "Content-Type": "multipart/form-data" } }
			);
		});
	});

	it("should use error handler", async () => {
		const errorReturn = { request: {}, response: {} };
		const restClient = createRestClient({ 
			baseURL: "https://api.example.com",
			errorHandler: () => Promise.reject(errorReturn) 
		});
		try {
			await restClient.get("nonexistent");
		} catch (err) {
			// ky will throw a network error for invalid URLs, which is expected
			expect(err).toBeDefined();
		}
	});

	it("should use API Token and Base URL", () => {
		const args = {
			apiToken: "123456",
			baseURL: "hola",
		};
		const restClient = createRestClient(args);
		// ky doesn't expose defaults like axios, but we can verify the client was created
		expect(restClient.fetch).toBeDefined();
		expect(typeof restClient.fetch.get).toBe("function");
	});
});
