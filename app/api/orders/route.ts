import {deliveryTiming,dateBoundary} from '@/lib/order-types';
import {Xendit} from 'xendit-node';
import {getDb} from '@/db';
import {expireDemoOrders,payDemoOrder,readOrder,markPaid,completeOrder,activeOrderCount,searchOrders} from '@/db/order-store';
import {orderOwner} from '@/lib/order-owner';
import {json,sameOrigin} from '@/lib/auth';
export async function GET(request:Request){try{const {owner}=await orderOwner(request);if(!owner)return json({error:'Masuk dengan Google untuk melihat history pembelian.'},401);const db=getDb(),params=new URL(request.url).searchParams;await expireDemoOrders(db,owner);const id=params.get('id');if(id){const order=await readOrder(db,owner,id);return order?json({order}):json({error:'Pesanan tidak ditemukan'},404);}const activeCount=await activeOrderCount(db,owner);if(params.get('summary')==='1')return json({activeCount});
 const status=params.get('status')||'',method=params.get('method')||'',q=(params.get('q')||'').trim().slice(0,100),offset=Number(params.get('offset')||0);
 if(!['','ACTIVE','CREATING','PENDING','PAID','COMPLETED','EXPIRED','FAILED','UNSUCCESSFUL'].includes(status)||!['','regular','express'].includes(method)||!Number.isSafeInteger(offset)||offset<0)return json({error:'Filter tidak valid.'},400);
 const from=params.get('from'),to=params.get('to'),start=from?dateBoundary(from):undefined,end=to?dateBoundary(to)+86400000:undefined;
 if((start!==undefined&&!Number.isFinite(start))||(end!==undefined&&!Number.isFinite(end))||(start!==undefined&&end!==undefined&&start>=end))return json({error:'Rentang tanggal tidak valid.'},400);
 return json({...await searchOrders(db,owner,q,status,method,offset,start,end),activeCount});}catch{return json({error:'Pesanan belum dapat dimuat. Coba kembali.'},503);}}
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Permintaan tidak diizinkan.'},403);
 try{const {owner}=await orderOwner(request);if(!owner)return json({error:'Sesi pesanan tidak tersedia.'},401);
 const {id,action}=await request.json() as {id:unknown;action:string};if(typeof id!=='string'||!['simulate','refresh','complete'].includes(action))return json({error:'Permintaan tidak valid.'},400);
 const db=getDb();await expireDemoOrders(db,owner);const order=await readOrder(db,owner,id);if(!order)return json({error:'Pesanan tidak ditemukan.'},404);
 if(action==='complete'){if(order.status!=='COMPLETED'){if(order.status!=='PAID'||order.paidAt===null||Date.now()-order.paidAt<deliveryTiming(order.data.deliveryMethod).total)return json({error:'Pesanan hanya dapat diselesaikan setelah sampai di tujuan.'},409);await completeOrder(db,owner,id,Date.now(),deliveryTiming(order.data.deliveryMethod).total);}}
 else if(action==='simulate'){if(order.data.mode!=='demo')return json({error:'Pembayaran Xendit harus diverifikasi melalui Xendit.'},400);await payDemoOrder(db,owner,id,Date.now());await expireDemoOrders(db,owner);}
 else if(order.data.mode==='xendit-test'&&order.status==='PENDING'){
 const secret=process.env.XENDIT_SECRET_KEY;if(!secret?.startsWith('xnd_development_')||!order.invoiceId)return json({error:'Xendit Test belum tersedia.'},503);
 const inv=await new Xendit({secretKey:secret}).Invoice.getInvoiceById({invoiceId:order.invoiceId});
 if(inv.externalId!=='kopdes-'+id||inv.amount!==order.data.amount||inv.currency!=='IDR')return json({error:'Rincian invoice tidak cocok.'},409);
 if(['PAID','SETTLED'].includes(inv.status))await markPaid(db,owner,id,Date.now());
 else if(inv.status==='EXPIRED')await db.prepare("UPDATE kopdes_orders SET status = 'EXPIRED' WHERE id = ? AND owner = ? AND status = 'PENDING'").bind(id,owner).run();
 }
 return json({order:await readOrder(db,owner,id)});
 }catch{return json({error:'Status belum dapat diperiksa. Coba lagi.'},502);}
}
