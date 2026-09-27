import {authReady,cookie,json,NONCE} from '@/lib/auth';
export async function GET(request:Request){
 if(!authReady())return json({ready:false,clientId:null});
 const nonce=crypto.randomUUID();
 return json({ready:true,clientId:process.env.GOOGLE_CLIENT_ID,nonce},200,{'Set-Cookie':cookie(request,NONCE,nonce,300)});
}
