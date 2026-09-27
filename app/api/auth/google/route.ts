import {jwtVerify} from 'jose';
import {authReady,cookie,getCookie,googleKeys,json,NONCE,sameOrigin,SESSION,sessionToken} from '@/lib/auth';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Permintaan tidak diizinkan.'},403);
 if(!authReady())return json({error:'Login Google belum diaktifkan oleh pengelola.'},503);
 try{
  const body:any=await request.json();if(typeof body?.credential!=='string'||body.credential.length>16000)return json({error:'Kredensial tidak valid.'},400);
  const nonce=getCookie(request,NONCE);if(!nonce)return json({error:'Sesi login kedaluwarsa. Buka ulang panel akun.'},401);
  const {payload}=await jwtVerify(body.credential,googleKeys,{audience:process.env.GOOGLE_CLIENT_ID,issuer:['https://accounts.google.com','accounts.google.com'],algorithms:['RS256'],maxTokenAge:'5m'});
  if(payload.nonce!==nonce||!payload.sub||payload.email_verified!==true||typeof payload.email!=='string')return json({error:'Akun Google tidak dapat diverifikasi.'},401);
  const user={id:payload.sub,name:typeof payload.name==='string'?payload.name.slice(0,100):'Anggota Kopdes',email:payload.email,picture:typeof payload.picture==='string'&&payload.picture.startsWith('https://')?payload.picture:undefined};
  const response=json({user});response.headers.append('Set-Cookie',cookie(request,SESSION,await sessionToken(user),604800));response.headers.append('Set-Cookie',cookie(request,NONCE,'',0));return response;
 }catch{return json({error:'Login gagal atau kedaluwarsa. Silakan coba lagi.'},401);}
}
