import {getDb} from '@/db';
import {json,sameOrigin} from '@/lib/auth';
import {adminUser,randomToken,digest} from '@/lib/admin-auth';
export async function POST(r:Request){if(!sameOrigin(r))return json({error:'Permintaan ditolak.'},403);try{const u=await adminUser(r);if(!u)return json({error:'Login admin diperlukan.'},401);const code=randomToken(),expiresAt=Date.now()+86400000;await getDb().prepare('INSERT INTO kopdes_admin_invites(hash,expires_at,created_by) VALUES(?,?,?)').bind(await digest(code),expiresAt,u.id).run();return json({code,expiresAt},201);}catch{return json({error:'Undangan belum dapat dibuat.'},503);}}
