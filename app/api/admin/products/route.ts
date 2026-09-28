import {getDb} from '@/db';
import {json,sameOrigin} from '@/lib/auth';
import {adminUser} from '@/lib/admin-auth';
import {readProducts} from '@/db/managed-store';
import {productSchema} from '@/lib/managed-catalog';
export async function GET(r:Request){try{if(!await adminUser(r))return json({error:'Login admin diperlukan.'},401);return json({products:await readProducts(getDb())});}catch{return json({error:'Produk belum dapat dimuat.'},503);}}
export async function POST(r:Request){return save(r,true);}
export async function PUT(r:Request){return save(r,false);}
async function save(r:Request,create:boolean){if(!sameOrigin(r))return json({error:'Permintaan ditolak.'},403);try{if(!await adminUser(r))return json({error:'Login admin diperlukan.'},401);const b:any=await r.json(),parsed=productSchema.safeParse(b.product);if(!parsed.success||(!create&&(!Number.isInteger(b.version)||b.version<0)))return json({error:'Periksa data produk, harga, stok, dan URL gambar.'},400);const db=getDb();await readProducts(db);const p=parsed.data;let result;
if(create)result=await db.prepare('INSERT OR IGNORE INTO kopdes_products(id,data,version,updated_at) VALUES(?,?,0,?)').bind(p.id,JSON.stringify(p),Date.now()).run();else result=await db.prepare('UPDATE kopdes_products SET data=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(JSON.stringify(p),Date.now(),p.id,b.version).run();
if(result.meta.changes!==1)return json({error:create?'ID produk sudah digunakan.':'Data berubah di tab lain. Muat ulang produk sebelum menyimpan.'},409);return json({ok:true,products:await readProducts(db)});
}catch{return json({error:'Produk belum dapat disimpan.'},503);}}
