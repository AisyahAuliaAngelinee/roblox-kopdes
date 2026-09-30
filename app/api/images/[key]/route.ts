import {imageStore} from '@/lib/image-store';
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}) {
 const {key}=await params;
 if(!/^[a-f0-9-]{36}\.(png|jpg)$/.test(key)) return new Response('Not found',{status:404});
 try {const object=await imageStore.get(key); if(!object) return new Response('Not found',{status:404});
 return new Response(object.body,{headers:{'Content-Type':object.contentType,'Content-Length':String(object.size),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','ETag':object.etag}});
 } catch {return new Response('Gambar sementara tidak tersedia',{status:503});}
}
