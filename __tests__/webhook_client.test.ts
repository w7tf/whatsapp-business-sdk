import { describe, it, beforeEach, expect, vi } from "vitest";
import {
	createWebhookGetHandler,
	createWebhookPostHandler,
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

	it("should create webhook handlers", () => {
		const token = "test-token";
		
		const getHandler = createWebhookGetHandler(token);
		const postHandler = createWebhookPostHandler(events);

		expect(typeof getHandler).toBe("function");
		expect(typeof postHandler).toBe("function");
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

	it("webhook post controller", async () => {
		const req = {
			body: {} as any,
			query: {}
		};
		const response = await createWebhookPostHandler(events)(req);
		expect(response.status).toBe(200);
		expect(response.body).toBe("success");
	});

	it("webhook handler fires the events", async () => {
		const body = webhookBody;
		const fields = webhookBodyFields;
		const contact = body.entry[0].changes[0].value.contacts[0];
		const metadata = body.entry[0].changes[0].value.metadata;

		await webhookHandler(body, events);
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