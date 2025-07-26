# WhatsApp Business SDK (Worker Compatible)

> Worker-compatible fork of [whatsapp-business-sdk](https://github.com/MarcosNicolau/whatsapp-business-sdk) with zero Node.js dependencies

A TypeScript connector for WhatsApp Business APIs

## Key Features

- ✅ **Zero Node.js runtime dependencies** - works anywhere JavaScript runs
- ✅ **Worker environment compatible** - Cloudflare Workers, Deno Deploy, etc.
- ✅ **Web-standard APIs** - Uses File, Blob, ArrayBuffer instead of filesystem
- ✅ **Framework-agnostic webhooks** - No Express dependency required
- ✅ **Full TypeScript support** - Comprehensive type definitions
- ✅ **Comprehensive test coverage** - Reliable and well-tested

## Key Differences from Original

This fork modernizes the SDK for worker environments:

- **Media Upload**: Uses `File`/`Blob` instead of file paths
- **Media Download**: Returns `ArrayBuffer` instead of writing to filesystem  
- **Webhooks**: Framework-agnostic helpers instead of Express-only client
- **Dependencies**: Replaced `axios` with `ky`, removed `express` and `fs`
- **Testing**: Migrated from Jest to Vitest for better ES module support

## Installation

```bash
npm install @w7tf/whatsapp-business
# or
yarn add @w7tf/whatsapp-business
# or
pnpm add @w7tf/whatsapp-business
```

**Zero Node.js dependencies** - works in any JavaScript environment.

## Environment Compatibility

This SDK works in any modern JavaScript environment:

- ✅ **Node.js 18+** - Uses built-in File/Blob support  
- ✅ **Worker Environments** - Cloudflare Workers, Deno Deploy, etc.
- ✅ **Edge Functions** - Vercel Edge, Netlify Edge, etc.
- ✅ **Serverless** - AWS Lambda, Google Cloud Functions, etc.

## Documentation

Most methods accept JS objects. These can be populated using parameters specified by [WhatsApp's API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/overview) or following the TypeScript schema.

# Usage

## Basic Usage

```typescript
import { WABAClient, WABAErrorAPI } from "@w7tf/whatsapp-business";

// You can get these from the Meta for Developers app administration
const client = new WABAClient({
	accountId: "<YOUR_ACCOUNT_ID>",
	apiToken: "<YOUR_API_TOKEN>",
	phoneId: "<YOUR_BUSINESS_PHONE_ID>",
});

const foo = async () => {
	try {
		const res = await client.getBusinessPhoneNumbers();
		console.log(res);
	} catch (err) {
		const error: WABAErrorAPI = err;
		console.error(error.message);
	}
};

foo();
```

## Sending Messages

You can send a text message:

```typescript
const sendTextMessage = async (body: string, to: string) => {
	try {
		const res = await client.sendMessage({ to, type: "text", text: { body } });
		console.log(res);
	} catch (err) {
		const error: WABAErrorAPI = err;
		console.error(error.message);
	}
};
```

Or an image:

```typescript
const sendPictureMessage = async ({ link, caption }: MediaObject, to: string) => {
	try {
		const res = await client.sendMessage({ to, type: "image", image: { link, caption } });
		console.log(res);
	} catch (err) {
		const error: WABAErrorAPI = err;
		console.error(error.message);
	}
};

sendPictureMessage(
	{ link: "<url_link_to_your_image>", caption: "<image_description>" },
	"<PHONE_NUMBER>"
);
```

## Media Upload/Download

### Upload Media (File/Blob)

```typescript
// From Blob (any environment)
const blob = new Blob([data], { type: "image/jpeg" });
const response = await client.uploadMedia({ file: blob, type: "image" });

// From File constructor (worker environments)
const file = new File([arrayBuffer], "image.jpg", { type: "image/jpeg" });
const response = await client.uploadMedia({ file, type: "image" });
```

### Download Media (ArrayBuffer)

```typescript
const mediaUrl = "https://...";
const arrayBuffer = await client.downloadMedia(mediaUrl);

// Convert to Blob if needed
const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

// In worker, return as Response
return new Response(arrayBuffer, {
  headers: { "Content-Type": "image/jpeg" }
});
```

## Webhooks (Framework-Agnostic)

The webhook system is now framework-agnostic and works with any HTTP framework or environment.

### Core Webhook Processing

```typescript
import { webhookHandler } from "@w7tf/whatsapp-business";

// Process webhook payload directly
webhookHandler(webhookBody, {
	onMessageReceived: (message, contact, metadata) => {
		console.log("Message received:", message);
	},
	onTextMessageReceived: (textMessage, contact, metadata) => {
		console.log("Text message:", textMessage.text.body);
	},
	onStatusReceived: (status, metadata) => {
		console.log("Message status:", status.status);
	},
	onError: (error) => {
		console.error("Webhook error:", error);
	}
});
```


## API Support

| Cloud API                                     |
| --------------------------------------------- |
| <ul><li>- [x] Business profiles endpoints     |
| <ul><li>- [x] Media endpoints                 |
| <ul><li>- [x] Message endpoints               |
| <ul><li>- [x] Phone Numbers endpoints         |
| <ul><li>- [x] Registration endpoints          |
| <ul><li>- [x] Two-Step-Verification endpoints |

| Webhooks                          |
| --------------------------------- |
| <ul><li>- [x] Cloud API           |
| <ul><li>- [ ] Business Management |

## License

MIT License - see [LICENSE](LICENSE) file.

## Attribution

This is a fork of [whatsapp-business-sdk](https://github.com/MarcosNicolau/whatsapp-business-sdk) by [MarcosNicolau](https://github.com/MarcosNicolau), modified for worker environment compatibility.

## Contribution
