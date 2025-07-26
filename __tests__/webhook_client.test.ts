import { describe, it, beforeEach, expect, vi } from "vitest";
import {
	createWebhookGetHandler,
	createWebhookPostHandler,
	createConvexWebhookHandler,
	webhookHandler,
} from "../src/webhooks/helpers";
import { webhookBody, webhookBodyFields } from "./utils";
import { WebhookEvents } from "../src/types";

describe("Webhook Helpers tests", () => {
	const events: WebhookEvents = {
		onError: vi.fn(),
		onMessageReceived: vi.fn(),
		onStartListening: vi.fn(),
		onStatusReceived: vi.fn(),
		onTextMessageReceived: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	it("should create framework-specific handlers", () => {
		const token = "test-token";
		
		const convexHandler = createConvexWebhookHandler(events, token);

		expect(typeof convexHandler).toBe("function");
	});

	it("should handle Convex webhook requests", () => {
		const token = "test-token";
		const handler = createConvexWebhookHandler(events, token);

		const getRequest = {
			method: "GET",
			body: {} as any,
			query: {
				"hub.mode": "subscribe",
				"hub.verify_token": token,
				"hub.challenge": "CHALLENGE"
			}
		};

		const getResponse = handler(getRequest);
		expect(getResponse.status).toBe(200);
		expect(getResponse.body).toBe("CHALLENGE");

		const postRequest = {
			method: "POST",
			body: webhookBody,
			query: {}
		};

		const postResponse = handler(postRequest);
		expect(postResponse.status).toBe(200);
		expect(postResponse.body).toBe("success");
	});

	it("webhook get controller should properly subscribe", () => {
		const token = "TOKEN";
		const req = {
			body: {} as any,
			query: {
				"hub.mode": "subscribe",
				"hub.verify_token": token,
				"hub.challenge": "CHALLENGE"
			}
		};
		const response = createWebhookGetHandler(token)(req);

		expect(response.status).toBe(200);
		expect(response.body).toBe("CHALLENGE");
	});

	it("webhook post controller", () => {
		const req = {
			body: {} as any,
			query: {}
		};
		const response = createWebhookPostHandler(events)(req);
		expect(response.status).toBe(200);
		expect(response.body).toBe("success");
	});

	it("webhook handler fires the events", () => {
		const body = webhookBody;
		const fields = webhookBodyFields;
		const contact = body.entry[0].changes[0].value.contacts[0];
		const metadata = body.entry[0].changes[0].value.metadata;

		webhookHandler(body, events);
		expect(events.onMessageReceived).toHaveBeenCalledTimes(2);
		expect(events.onError).toHaveBeenCalledTimes(2);
		expect(events.onStatusReceived).toHaveBeenCalledTimes(2);
		expect(events.onTextMessageReceived).toHaveBeenCalledTimes(1);
		expect(events.onMessageReceived).toHaveBeenCalledWith(fields.message, contact, metadata);
		expect(events.onTextMessageReceived).toHaveBeenCalledWith(
			fields.textMessage,
			contact,
			metadata
		);
		expect(events.onError).toHaveBeenCalledWith(fields.error);
		expect(events.onStatusReceived).toHaveBeenCalledWith(fields.status, metadata);
	});
});