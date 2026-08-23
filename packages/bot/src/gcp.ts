import { Readable } from "node:stream";
import { fileTypeFromBuffer, fileTypeFromStream } from "file-type";
import { S3mini } from "s3mini";
import type { Attachment } from "seyfert";
import { object } from "zod";

const s3 = new S3mini({
	accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
	secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
	// Bucket-scoped endpoint — include your bucket name in the path
	endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com/pluralbuddy-data`,
	region: "auto",
});

export async function getGcpAccessToken() {
	// GCP OAuth2 Service Account JWT authentication

	// 1. Gather credentials
	const clientEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
	let privateKey = process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";

	// a. Fix escaped newlines for multiline key
	privateKey = privateKey.replace(/\\n/g, "\n");

	const now = Math.floor(Date.now() / 1000);
	const payload = {
		iss: clientEmail,
		scope: "https://www.googleapis.com/auth/devstorage.full_control",
		aud: "https://oauth2.googleapis.com/token",
		exp: now + 3600,
		iat: now,
	};

	// b. JWT header
	const header = {
		alg: "RS256",
		typ: "JWT",
	};

	function base64url(input: string | Buffer) {
		return Buffer.from(input)
			.toString("base64")
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	}

	// 2. Create JWT token
	const headerEncoded = base64url(JSON.stringify(header));
	const payloadEncoded = base64url(JSON.stringify(payload));
	const data = `${headerEncoded}.${payloadEncoded}`;

	// 3. Sign JWT using RS256
	const crypto = await import("node:crypto");
	const signer = crypto.createSign("RSA-SHA256");
	signer.update(data);
	signer.end();
	const signature = signer.sign(privateKey);
	const signatureEncoded = base64url(signature);

	const jwt = `${data}.${signatureEncoded}`;

	// 4. Request access token from Google
	const params = new URLSearchParams();
	params.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
	params.set("assertion", jwt);

	const resp = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	if (!resp.ok) {
		const text = await resp.text();
		throw new Error(`Failed to get GCP access token: ${resp.status} ${text}`);
	}

	const respBody = (await resp.json()) as { access_token: string };
	const accessToken = respBody.access_token;

	return accessToken;
}

export async function deleteAttachment(
	storagePrefix: string,
) {
	const prefix = `${(process.env.BRANCH ?? "c")[0]}/${storagePrefix}`;

	const objects = await s3.listObjects("/", prefix);
	console.log(objects)
	if (objects === null) return null;

	return await s3.deleteObjects(objects.map((c) => c.Key));
}

export async function uploadAttachment(
	attachment: Attachment,
	objectName: string,
	metadata: Record<string, string>,
	oldObject?: string,
) {
	const attachmentUrl = attachment.url;
	const discordResponse = await fetch(attachmentUrl);

	if (!discordResponse.ok) {
		throw new Error("Failed to fetch the image from Discord.");
	}

	if (!discordResponse.body) {
		throw new Error("Response body is null.");
	}

	const buffer = await Bun.readableStreamToArrayBuffer(discordResponse.body);
	const fileType = await fileTypeFromBuffer(buffer);
	const headeredMetadata: Record<string, string> = {};

	Object.keys(metadata).forEach((c) => {
		headeredMetadata[`x-amz-meta-${c}`] = metadata[c] ?? "";
	});

	await s3.putObject(
		`${objectName}.${fileType?.ext}`,
		buffer,
		fileType?.mime,
		undefined,
		headeredMetadata
	);

	if (oldObject) {
		await s3.deleteObject(oldObject)
	}

	return `https://img.pb.giftedly.dev/${objectName}.${fileType?.ext}`;
}

export function getOldObject({imageProperty = "", storagePrefix}: {imageProperty?: string | null, storagePrefix: string }) {
	return ((imageProperty ?? "").startsWith("https://pluralbuddy.giftedly.dev")) || (imageProperty ?? "").startsWith("https://img.pb.giftedly.dev")
		? `${(process.env.BRANCH ?? "a")[0]}/${storagePrefix}${(imageProperty ?? "").split(storagePrefix)[1]}`
		: undefined;
}