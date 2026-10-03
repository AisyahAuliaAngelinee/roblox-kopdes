import type {Order,OrderData} from '../lib/order-types';
type Row={id:string;status:string;created_at:number;paid_at:number|null;completed_at:number|null;invoice_id:string|null;url:string|null;data:string};
export function parseOrder(row:Row):Order{return {id:row.id,status:row.status,createdAt:row.created_at,paidAt:row.paid_at,completedAt:row.completed_at??null,invoiceId:row.invoice_id,url:row.url,data:JSON.parse(row.data)};}
export async function readOrder(db:D1Database,owner:string,id:string){const row=await db.prepare('SELECT * FROM kopdes_orders WHERE owner = ? AND id = ?').bind(owner,id).first<Row>();return row?parseOrder(row):null;}
export async function listOrders(db:D1Database,owner:string){const rows=await db.prepare('SELECT * FROM kopdes_orders WHERE owner = ? ORDER BY created_at DESC LIMIT 50').bind(owner).all<Row>();return rows.results.map(parseOrder);}
export async function insertOrder(db:D1Database,owner:string,id:string,data:OrderData){await db.prepare('INSERT INTO kopdes_orders (id,owner,data,status,created_at) VALUES (?,?,?,?,?)').bind(id,owner,JSON.stringify(data),'CREATING',Date.now()).run();}
// D1 batch is a transaction: the claim, stock changes, and PAID status commit together.
// Only PENDING orders can be claimed, so repeated/concurrent confirmations never debit twice.
async function applyPayment(db:D1Database,owner:string,id:string,at:number,demo:boolean){
 const quantities=`SELECT json_extract(value,'$.id') product_id,SUM(CAST(json_extract(value,'$.quantity') AS INTEGER)) quantity FROM json_each(kopdes_orders.data,'$.items') GROUP BY json_extract(value,'$.id')`;
 const shortages=`SELECT json_group_array(json_object('id',q.product_id,'quantity',q.quantity,'shortfall',q.quantity-COALESCE(json_extract(p.data,'$.stock'),0))) FROM (${quantities}) q LEFT JOIN kopdes_products p ON p.id=q.product_id WHERE q.quantity>COALESCE(json_extract(p.data,'$.stock'),0)`;
 const guard=demo?` AND json_extract(data,'$.mode')='demo' AND COALESCE(json_extract(data,'$.expiresAt'),created_at+86400000)>? AND NOT EXISTS(SELECT 1 FROM (${quantities}) q LEFT JOIN kopdes_products p ON p.id=q.product_id WHERE q.quantity>COALESCE(json_extract(p.data,'$.stock'),0))`:'';
 const claim=db.prepare(`UPDATE kopdes_orders SET status='APPLYING_STOCK',data=json_set(data,'$.inventoryShortages',json((${shortages}))) WHERE id=? AND owner=? AND status='PENDING'${guard}`).bind(id,owner,...(demo?[at]:[]));
 const debit=db.prepare(`UPDATE kopdes_products SET data=json_set(data,'$.stock',MAX(0,CAST(json_extract(data,'$.stock') AS INTEGER)-(SELECT SUM(CAST(json_extract(j.value,'$.quantity') AS INTEGER)) FROM kopdes_orders o,json_each(o.data,'$.items') j WHERE o.id=? AND o.owner=? AND o.status='APPLYING_STOCK' AND json_extract(j.value,'$.id')=kopdes_products.id))),version=version+1,updated_at=? WHERE id IN (SELECT json_extract(j.value,'$.id') FROM kopdes_orders o,json_each(o.data,'$.items') j WHERE o.id=? AND o.owner=? AND o.status='APPLYING_STOCK')`).bind(id,owner,at,id,owner);
 const paid=db.prepare("UPDATE kopdes_orders SET status='PAID',paid_at=COALESCE(paid_at,?),data=json_set(data,'$.stockDeductedAt',?) WHERE id=? AND owner=? AND status='APPLYING_STOCK'").bind(at,at,id,owner);
 const results=await db.batch([claim,debit,paid]);return results[2].meta.changes===1;
}
export async function markPaid(db:D1Database,owner:string,id:string,at:number){return applyPayment(db,owner,id,at,false);}


export async function completeOrder(db:D1Database,owner:string,id:string,now:number,duration=120000){await db.prepare("UPDATE kopdes_orders SET status = 'COMPLETED', completed_at = ? WHERE id = ? AND owner = ? AND status = 'PAID' AND paid_at IS NOT NULL AND paid_at <= ?").bind(now,id,owner,now-duration).run();}

export async function activeOrderCount(db:D1Database,owner:string){const row=await db.prepare("SELECT COUNT(*) AS count FROM kopdes_orders WHERE owner = ? AND status IN ('CREATING','PENDING','PAID')").bind(owner).first<{count:number}>();return row?.count??0;}
export async function searchOrders(db:D1Database,owner:string,q:string,status:string,method:string,offset:number,from?:number,to?:number){
 const where=['owner = ?'];const args:(string|number)[]=[owner];
 if(status==='ACTIVE')where.push("status IN ('CREATING','PENDING','PAID')");else if(status==='UNSUCCESSFUL')where.push("status IN ('EXPIRED','FAILED')");else if(status){where.push('status = ?');args.push(status);}
 if(from!==undefined){where.push('created_at >= ?');args.push(from);}if(to!==undefined){where.push('created_at < ?');args.push(to);}
 if(method){where.push("COALESCE(json_extract(data,'$.deliveryMethod'),'regular') = ?");args.push(method);}
 if(q){where.push("(instr(lower(id),lower(?)) > 0 OR instr(lower(COALESCE(invoice_id,'')),lower(?)) > 0 OR instr(lower(json_extract(data,'$.items')),lower(?)) > 0 OR instr(lower(json_extract(data,'$.address.recipient')),lower(?)) > 0)");args.push(q,q,q,q);}
 const rows=await db.prepare('SELECT * FROM kopdes_orders WHERE '+where.join(' AND ')+' ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?').bind(...args,offset).all<Row>();
 return {orders:rows.results.slice(0,50).map(parseOrder),hasMore:rows.results.length>50};
}

export async function expireDemoOrders(db:D1Database,owner:string,now=Date.now()){await db.prepare("UPDATE kopdes_orders SET status = 'EXPIRED' WHERE owner = ? AND status = 'PENDING' AND json_extract(data,'$.mode') = 'demo' AND COALESCE(json_extract(data,'$.expiresAt'),created_at+86400000) <= ?").bind(owner,now).run();}
export async function payDemoOrder(db:D1Database,owner:string,id:string,now:number){return applyPayment(db,owner,id,now,true);}
