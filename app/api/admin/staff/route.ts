import {z} from 'zod';
import {getDb} from '@/db';
import {json,sameOrigin} from '@/lib/auth';
import {adminUser} from '@/lib/admin-auth';
import {readStaff} from '@/db/managed-store';
import {staffSchema} from '@/lib/managed-catalog';
export async function GET(r:Request){try{if(!await adminUser(r))return json({error:'Login admin diperlukan.'},401);return json(await readStaff(getDb()));}catch{return json({error:'Karyawan belum dapat dimuat.'},503);}}
export async function PUT(r:Request){if(!sameOrigin(r))return json({error:'Permintaan ditolak.'},403);try{if(!await adminUser(r))return json({error:'Login admin diperlukan.'},401);const b:any=await r.json(),parsed=z.array(staffSchema).min(1).max(30).safeParse(b.staff);if(!parsed.success||new Set(parsed.data.map(s=>s.id)).size!==parsed.data.length||!Number.isInteger(b.version)||b.version<0)return json({error:'Periksa data karyawan dan URL gambar.'},400);const db=getDb();await readStaff(db);const result=await db.prepare("UPDATE kopdes_content SET data=?,version=version+1 WHERE id='staff' AND version=?").bind(JSON.stringify(parsed.data),b.version).run();if(result.meta.changes!==1)return json({error:'Data berubah di tab lain. Muat ulang sebelum menyimpan.'},409);return json(await readStaff(db));}catch{return json({error:'Karyawan belum dapat disimpan.'},503);}}
