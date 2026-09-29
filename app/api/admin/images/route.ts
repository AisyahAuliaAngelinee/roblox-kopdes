import {adminUser} from '@/lib/admin-auth';
import {json,sameOrigin} from '@/lib/auth';
import {imageStore} from '@/lib/image-store';
import {ImageInputError,readImageBytes,imageType,publicImageUrl} from '@/lib/image-upload';
export async function POST(request:Request) {
 if(!sameOrigin(request)) return json({error:'Permintaan ditolak.'},403);
 try {
  if(!await adminUser(request)) return json({error:'Login admin diperlukan.'},401);
  let body=request.body, length=request.headers.get('content-length');
  if(request.headers.get('content-type')?.includes('application/json')) {
   if(Number(length)>4096) return json({error:'URL terlalu panjang.'},400);
   const input=await request.json() as {url?:unknown}; if(typeof input.url!=='string'||input.url.length>2000) throw new ImageInputError('URL gambar tidak valid.');
   let url=publicImageUrl(input.url), response:Response|undefined;
   for(let i=0;i<4;i++) {
    response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Accept:'image/png,image/jpeg'}});
    if(response.status>=300&&response.status<400) { const location=response.headers.get('location'); await response.body?.cancel(); if(!location) throw new ImageInputError('URL gambar tidak dapat dibuka.'); url=publicImageUrl(new URL(location,url).href); continue; }
    break;
   }
   if(!response?.ok) throw new ImageInputError('Gambar dari URL tidak dapat diambil. Coba unggah file.');
   body=response.body; length=response.headers.get('content-length');
  } else if(!['image/png','image/jpeg'].includes(request.headers.get('content-type')?.split(';')[0]||'')) {
   throw new ImageInputError('Pilih file PNG, JPG, atau JPEG.');
  }
  const bytes=await readImageBytes(body,length), format=imageType(bytes), key=crypto.randomUUID()+'.'+format.extension;
  await imageStore().put(key,bytes,{httpMetadata:{contentType:format.type,cacheControl:'public, max-age=31536000, immutable'}});
  return json({url:'/api/images/'+key,size:bytes.length},201);
 } catch(error) {
  if(error instanceof ImageInputError) return json({error:error.message},400);
  console.error('admin_image_upload_failed',error instanceof Error?error.name:'unknown');
  return json({error:'Gambar belum dapat disimpan. Coba kembali atau unggah file dari perangkat.'},503);
 }
}
