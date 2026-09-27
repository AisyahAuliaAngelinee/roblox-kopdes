import {getDb} from '@/db';
import {json,sameOrigin} from '@/lib/auth';
import {orderOwner} from '@/lib/order-owner';
import {products} from '@/lib/catalog';
import {expireDemoOrders,listOrders} from '@/db/order-store';
import {syncCatalog,productNotices} from '@/db/notification-store';
import {orderNotices} from '@/lib/notifications';
export async function GET(request:Request){try{const {owner}=await orderOwner(request);if(!owner)return json({error:'Masuk untuk melihat notifikasi.'},401);const db=getDb(),now=Date.now();await syncCatalog(db,products,now);await expireDemoOrders(db,owner,now);const notices=[...orderNotices(await listOrders(db,owner),now),...await productNotices(db)].sort((a,b)=>b.at-a.at).slice(0,100);const read=await db.prepare('SELECT read_at FROM kopdes_notification_reads WHERE owner=?').bind(owner).first<{read_at:number}>();return json({notices,readAt:read?.read_at??0,asOf:now});}catch{return json({error:'Notifikasi belum dapat dimuat.'},503);}}
export async function POST(request:Request){if(!sameOrigin(request))return json({error:'Permintaan tidak diizinkan.'},403);try{const {owner}=await orderOwner(request);if(!owner)return json({error:'Masuk untuk melihat notifikasi.'},401);const {readAt}=await request.json() as {readAt:number};if(!Number.isSafeInteger(readAt)||readAt<0||readAt>Date.now()+1000)return json({error:'Waktu tidak valid.'},400);await getDb().prepare('INSERT INTO kopdes_notification_reads(owner,read_at) VALUES(?,?) ON CONFLICT(owner) DO UPDATE SET read_at=MAX(read_at,excluded.read_at)').bind(owner,readAt).run();return json({ok:true});}catch{return json({error:'Notifikasi belum dapat disimpan.'},503);}}
