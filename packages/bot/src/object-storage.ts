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