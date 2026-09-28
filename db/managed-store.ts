import {products as defaults,type Product} from '../lib/catalog';
import {initialStaff,type Staff} from '../lib/managed-catalog';
export async function readProducts(db:D1Database):Promise<(Product&{version:number})[]>{
 if(!await db.prepare("SELECT id FROM kopdes_content WHERE id='catalog-seeded'").first())await db.batch([...defaults.map(p=>db.prepare('INSERT OR IGNORE INTO kopdes_products(id,data,version,updated_at) VALUES(?,?,0,?)').bind(p.id,JSON.stringify(p),Date.now())),db.prepare("INSERT OR IGNORE INTO kopdes_content(id,data,version) VALUES('catalog-seeded','true',0)")]);
 const rows=await db.prepare('SELECT data,version FROM kopdes_products ORDER BY updated_at,id').all<{data:string;version:number}>();return rows.results.map(r=>({...JSON.parse(r.data),version:r.version}));
}
export async function readStaff(db:D1Database):Promise<{staff:Staff[];version:number}>{await db.prepare("INSERT OR IGNORE INTO kopdes_content(id,data,version) VALUES('staff',?,0)").bind(JSON.stringify(initialStaff)).run();const r=await db.prepare("SELECT data,version FROM kopdes_content WHERE id='staff'").first<{data:string;version:number}>();return r?{staff:JSON.parse(r.data),version:r.version}:{staff:initialStaff,version:0};}
