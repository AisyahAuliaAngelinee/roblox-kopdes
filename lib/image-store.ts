import {getCloudflareContext} from '@opennextjs/cloudflare';
export function imageStore(): R2Bucket {
 const bucket=(getCloudflareContext().env as unknown as {IMAGES?:R2Bucket}).IMAGES;
 if(!bucket) throw new Error('Image storage unavailable');
 return bucket;
}
