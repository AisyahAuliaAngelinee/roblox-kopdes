import {createRemoteJWKSet,jwtVerify,SignJWT} from 'jose';
import type {User} from './profile';
export const googleKeys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export const SESSION='kopdes_session';
export const NONCE='kopdes_google_nonce';
export function authReady(){return !!process.env.GOOGLE_CLIENT_ID && (process.env.SESSION_SECRET?.length??0)>=32;}
export function getCookie(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';}
export function cookie(request:Request,name:string,value:string,age:number){return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin && request.headers.get('sec-fetch-site')!=='cross-site';}
export function json(value:unknown,status=200,extra:Record<string,string>={}){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store',...extra}});}
export async function sessionToken(user:User){if(!authReady())throw new Error('Auth not configured');return new SignJWT({name:user.name,email:user.email,picture:user.picture}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuer('kopdes').setAudience('kopdes-web').setIssuedAt().setExpirationTime('7d').sign(new TextEncoder().encode(process.env.SESSION_SECRET));}
export async function getUser(request:Request):Promise<User|null>{if(!authReady())return null;try{const {payload}=await jwtVerify(getCookie(request,SESSION),new TextEncoder().encode(process.env.SESSION_SECRET),{issuer:'kopdes',audience:'kopdes-web',algorithms:['HS256']});if(!payload.sub||typeof payload.name!=='string'||typeof payload.email!=='string')return null;return {id:payload.sub,name:payload.name,email:payload.email,picture:typeof payload.picture==='string'&&payload.picture.startsWith('https://')?payload.picture:undefined};}catch{return null;}}
