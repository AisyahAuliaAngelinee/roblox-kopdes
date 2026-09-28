import {getDb} from '@/db';
import {getCookie,cookie} from './auth';
export const ADMIN_COOKIE='kopdes_admin';
export const hex=(a:ArrayBuffer)=>Array.from(new Uint8Array(a),b=>b.toString(16).padStart(2,'0')).join('');
export const randomToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export async function digest(s:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
export async function passwordHash(password:string,salt=randomToken()){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256);return salt+':'+hex(bits);
}
export async function verifyPassword(password:string,stored:string){const calculated=await passwordHash(password,stored.split(':')[0]);let different=calculated.length^stored.length;for(let i=0;i<calculated.length;i++)different|=calculated.charCodeAt(i)^(stored.charCodeAt(i)||0);return different===0;}
export async function adminUser(request:Request){const token=getCookie(request,ADMIN_COOKIE);if(!token)return null;return getDb().prepare('SELECT a.id,a.email,a.name FROM kopdes_admin_sessions s JOIN kopdes_admins a ON a.id=s.admin_id WHERE s.hash=? AND s.expires_at>?').bind(await digest(token),Date.now()).first<{id:string;email:string;name:string}>();}
export async function adminSession(request:Request,id:string){const token=randomToken();await getDb().prepare('INSERT INTO kopdes_admin_sessions(hash,admin_id,expires_at) VALUES(?,?,?)').bind(await digest(token),id,Date.now()+28800000).run();return cookie(request,ADMIN_COOKIE,token,28800);}
export async function rateLimit(request:Request,email:string){const db=getDb(),now=Date.now(),bucket=Math.floor(now/900000);const keys=[await digest('ip:'+ (request.headers.get('cf-connecting-ip')||'local')+':'+bucket),await digest('email:'+email+':'+bucket)];const rs=await db.batch(keys.map(k=>db.prepare('INSERT INTO kopdes_admin_limits(id,count,until) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(k,now+900000)));return rs.every((r:any,i:number)=>Number(r.results[0]?.count)<=(i===0?40:10));}
