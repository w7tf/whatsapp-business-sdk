import { Webhook, WebhookEvents } from "../types";

export const webhookHandler = (
	body: Webhook,
	{
		onError,
		onMessageReceived,
		onStatusReceived,
		onTextMessageReceived,
	}: Omit<WebhookEvents, "onStartListening">
) => {
	body.entry?.forEach((entry) => {
		entry?.changes?.forEach((change) => {
			//Generally, if not always, the message is just the index 0
			//But, since the docs don't say anything, we do it through a loop
			change?.value?.messages?.forEach((message) => {
				//The contact is always the 0 and it is only received when there the messages field is present
				const contact = change?.value?.contacts[0];
				//Call message event
				onMessageReceived && onMessageReceived(message, contact, change?.value?.metadata);
				//If the message is type of text, then call the respective event
				if (message.type === "text" && message.text)
					onTextMessageReceived &&
						onTextMessageReceived(
							{
								id: message.id,
								type: message.type,
								text: message.text,
								from: message.from,
								timestamp: message.timestamp,
							},
							contact,
							change?.value?.metadata
						);
			});
			//Call status event
			change?.value?.statuses?.forEach((status) => {
				onStatusReceived && onStatusReceived(status, change?.value?.metadata);
			});
			//Call error event
			change?.value?.errors?.forEach((err) => onError && onError(err));
		});
	});
};

export type WebhookRequest = {
	body: Webhook;
	query: Record<string, string | string[] | undefined>;
};

export type WebhookResponse = {
	status: number;
	body: string;
};

export const createWebhookPostHandler =
	(events: WebhookEvents) =>
	(request: WebhookRequest): WebhookResponse => {
		try {
			webhookHandler(request.body, events);
			return { status: 200, body: "success" };
		} catch (error) {
			console.error("Webhook processing error:", error);
			return { status: 500, body: "Internal Server Error" };
		}
	};

export const createWebhookGetHandler =
	(token: string) =>
	(request: WebhookRequest): WebhookResponse => {
		const { query } = request;

		if (query["hub.mode"] === "subscribe" && query["hub.verify_token"] === token) {
			try {
				const challenge = query["hub.challenge"];
				if (typeof challenge === "string") {
					return { status: 200, body: challenge };
				}
			} catch (err) {
				console.error("Could not subscribe to the webhook", `err: ${JSON.stringify(err)}`);
			}
		}
		return { status: 400, body: "Bad Request" };
	};
