export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export class ImageInputError extends Error {}
export async function readImageBytes(body: ReadableStream<Uint8Array> | null, length: string | null) {
  if (Number(length) > MAX_IMAGE_BYTES) throw new ImageInputError('Ukuran gambar maksimal 12 MB.');
  if (!body) throw new ImageInputError('Pilih gambar terlebih dahulu.');
  const reader = body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const {value, done} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > MAX_IMAGE_BYTES) { await reader.cancel(); throw new ImageInputError('Ukuran gambar maksimal 12 MB.'); }
    chunks.push(value);
  }} finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  if (!size) throw new ImageInputError('File gambar kosong.');
  return bytes;
}
export function imageType(bytes: Uint8Array) {
  if (bytes.length >= 24 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v) && String.fromCharCode(...bytes.slice(12,16))==='IHDR') return {type:'image/png',extension:'png'};
  if (bytes.length >= 4 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255 && bytes.at(-2)===255 && bytes.at(-1)===217) return {type:'image/jpeg',extension:'jpg'};
  throw new ImageInputError('Gambar harus berupa PNG, JPG, atau JPEG yang valid.');
}
export function publicImageUrl(value: unknown) {
  let u: URL; try { u = new URL(String(value)); } catch { throw new ImageInputError('Masukkan URL HTTPS gambar yang valid.'); }
  const host=u.hostname.toLowerCase();
  // Worker also enforces global_fetch_strictly_public, including DNS resolution.
  if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||!host.includes('.')||host.endsWith('.local')||host.endsWith('.localhost')||host.endsWith('.internal')||/^[\d.]+$/.test(host)||host.includes(':')||host.includes('[')) throw new ImageInputError('Gunakan URL HTTPS dari situs publik.');
  return u;
}
