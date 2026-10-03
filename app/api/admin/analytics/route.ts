import {getDb} from '@/db';
import {json} from '@/lib/auth';
import {adminUser} from '@/lib/admin-auth';
import {readProducts} from '@/db/managed-store';
import {aggregateAnalytics,periodBounds,type AnalyticsRow} from '@/lib/admin-analytics';
export async function GET(r:Request){try{
 if(!await adminUser(r))return json({error:'Login admin diperlukan.'},401);
 const q=new URL(r.url).searchParams,mode=q.get('mode')==='xendit-test'?'xendit-test':'demo';
 const options={period:q.get('period')||'last30',barPeriod:q.get('barPeriod')||'weekly',category:q.get('category')||'all',status:q.get('status')||'all',from:q.get('from'),to:q.get('to')};
 if(!['last30','all','daily','weekly','monthly','yearly','range'].includes(options.period)||!['weekly','monthly','yearly'].includes(options.barPeriod)||!['all','completed','failed','shipping'].includes(options.status))return json({error:'Filter analytics tidak valid.'},400);
 try{periodBounds(options.period,Date.now(),options.from,options.to);}catch(e){return json({error:(e as Error).message},400);}
 const db=getDb();const products=await readProducts(db);
 const records=await db.prepare("SELECT id,status,created_at,paid_at,data FROM kopdes_orders WHERE json_extract(data,'$.mode')=?").bind(mode).all<AnalyticsRow>();
 // Old orders may predate the category snapshot; recover it from the current catalog.
 const categoryById=new Map(products.map(p=>[p.id,p.category]));
 const rows=records.results.map(o=>{const data=JSON.parse(o.data);data.items=data.items.map((i:any)=>({...i,category:i.category||categoryById.get(i.id)||'Lainnya'}));return {...o,data:JSON.stringify(data)};});
 const inventoryAlerts=await db.prepare("SELECT id,json_extract(data,'$.inventoryShortages') shortages FROM kopdes_orders WHERE status='PAID' AND json_extract(data,'$.mode')=? AND json_array_length(data,'$.inventoryShortages')>0 ORDER BY paid_at DESC LIMIT 20").bind(mode).all<{id:string;shortages:string}>();
 return json({mode,...aggregateAnalytics(rows,options),inventoryAlerts:inventoryAlerts.results.map(r=>({id:r.id,items:JSON.parse(r.shortages)}))});
}catch(e){console.error('admin_analytics',e);return json({error:'Analytics belum dapat dimuat.'},503);}}
