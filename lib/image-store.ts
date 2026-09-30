import { getCloudflareContext } from "@opennextjs/cloudflare";
import { list, put } from "@vercel/blob";

export type StoredImage = {
	body: ReadableStream<Uint8Array>;
	size: number;
	contentType: string;
	etag: string;
};

// Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise the Cloudflare R2 binding.
export const imageStore = {
	async put(key: string, bytes: Uint8Array, contentType: string) {
		if (process.env.BLOB_READ_WRITE_TOKEN) {
			await put(key, Buffer.from(bytes), {
				access: "public",
				contentType,
				addRandomSuffix: false,
				allowOverwrite: true,
			});
			return;
		}
		await r2().put(key, bytes, {
			httpMetadata: {
				contentType,
				cacheControl: "public, max-age=31536000, immutable",
			},
		});
	},
	async get(key: string): Promise<StoredImage | null> {
		if (process.env.BLOB_READ_WRITE_TOKEN) {
			const blob = (await list({ prefix: key, limit: 1 })).blobs.find(
				(b) => b.pathname === key,
			);
			if (!blob) return null;
			const response = await fetch(blob.url);
			if (!response.ok || !response.body) return null;
			return {
				body: response.body,
				size: blob.size,
				contentType: response.headers.get("content-type") || "image/png",
				etag: `"${blob.etag}"`,
			};
		}
		const object = await r2().get(key);
		if (!object) return null;
		return {
			body: object.body as ReadableStream<Uint8Array>,
			size: object.size,
			contentType: object.httpMetadata?.contentType || "image/png",
			etag: object.httpEtag,
		};
	},
};

function r2(): R2Bucket {
	const bucket = (
		getCloudflareContext().env as unknown as { IMAGES?: R2Bucket }
	).IMAGES;
	if (!bucket) throw new Error("Image storage unavailable");
	return bucket;
}
