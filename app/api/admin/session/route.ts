import {getDb} from '@/db';
import {adminUser,ADMIN_COOKIE,digest} from '@/lib/admin-auth';
import {json,sameOrigin,getCookie,cookie} from '@/lib/auth';
export async function GET(r:Request){try{return json({user:await adminUser(r)});}catch{return json({error:'Layanan admin belum tersedia.'},503);}}
export async function DELETE(r:Request){if(!sameOrigin(r))return json({error:'Permintaan ditolak.'},403);try{await getDb().prepare('DELETE FROM kopdes_admin_sessions WHERE hash=?').bind(await digest(getCookie(r,ADMIN_COOKIE))).run();return json({ok:true},200,{'Set-Cookie':cookie(r,ADMIN_COOKIE,'',0)});}catch{return json({error:'Belum dapat keluar. Coba lagi.'},503);}}
