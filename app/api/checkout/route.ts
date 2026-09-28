import {Xendit} from 'xendit-node';
import {readProducts} from '@/db/managed-store';
import {addressSchema} from '@/lib/profile';
import {sameOrigin,json} from '@/lib/auth';
import {orderOwner} from '@/lib/order-owner';
import {getDb} from '@/db';
import {insertOrder,readOrder} from '@/db/order-store';
import type {OrderData} from '@/lib/order-types';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Permintaan tidak diizinkan.'},403);
 try{
 const identity=await orderOwner(request);
 if(!identity.user||!identity.owner)return json({error:'Masuk dengan Google sebelum checkout agar invoice menggunakan email akun Anda.',code:'LOGIN_REQUIRED'},401);
 const products=await readProducts(getDb());const body:any=await request.json();const address=addressSchema.safeParse(body.address);
 if(!['express','regular'].includes(body.deliveryMethod))return json({error:'Pilih pengiriman Express atau Regular.'},400);
 if(!['qris','gopay','bank'].includes(body.paymentMethod))return json({error:'Pilih metode pembayaran.'},400);
 if(body.paymentMethod==='bank'&&!['BCA','BRI','MANDIRI','BNI','PERMATA'].includes(body.bankCode))return json({error:'Pilih bank yang tersedia.'},400);
 if(body.note!==undefined&&(typeof body.note!=='string'||body.note.length>200))return json({error:'Catatan maksimal 200 karakter.'},400);
 if(!address.success)return json({error:'Simpan alamat pengantaran yang lengkap terlebih dahulu.'},400);
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>products.length)return json({error:'Keranjang tidak valid.'},400);
 const items:OrderData['items']=[];const seen=new Set<string>();
 for(const item of body.items){const p=products.find(p=>p.id===item.id);if(!p||seen.has(p.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>p.stock)return json({error:'Produk atau jumlah tidak valid.'},400);seen.add(p.id);items.push({id:p.id,name:p.name,category:p.category,price:p.price,quantity:item.quantity});}
 const secret=process.env.XENDIT_SECRET_KEY;
 if(secret&&!identity.user)return json({error:'Masuk dengan Google untuk menerima invoice Xendit di email akun Anda.'},401);
 if(secret&&!secret.startsWith('xnd_development_'))return json({error:'Prototipe hanya menerima kunci Xendit Test.'},503);
 const owner=identity.owner;
 const data:OrderData={note:body.note?.trim()||'',...(body.paymentMethod==='bank'?{bankCode:body.bankCode}:{}),paymentMethod:body.paymentMethod,expiresAt:Date.now()+86400000,items,address:address.data,amount:items.reduce((s,p)=>s+p.price*p.quantity,0),shipping:0,deliveryMethod:body.deliveryMethod,email:identity.user?.email||null,mode:secret?'xendit-test':'demo'};
 const db=getDb(),id=crypto.randomUUID();await insertOrder(db,owner,id,data);
 let invoiceId:string|null=null,url:string|null=null;
 try{if(secret){const a=data.address;const invoice=await new Xendit({secretKey:secret}).Invoice.createInvoice({data:{externalId:'kopdes-'+id,amount:data.amount,currency:'IDR',invoiceDuration:86400,paymentMethods:body.paymentMethod==='bank'?[body.bankCode]:['QRIS'],payerEmail:data.email!,shouldSendEmail:true,customer:{givenNames:identity.user!.name,email:data.email!,addresses:[{country:'Indonesia',streetLine1:a.street,streetLine2:a.village,city:a.city,postalCode:a.postalCode}]},customerNotificationPreference:{invoiceCreated:['email'],invoicePaid:['email']},items:items.map(p=>({name:p.name,quantity:p.quantity,price:p.price,referenceId:p.id})),description:`SIMULASI KOPDES. Catatan: ${data.note||'-'}. Tujuan: ${a.recipient}, ${a.street}, ${a.village}, ${a.city} ${a.postalCode}. Pengiriman ${data.deliveryMethod==='express'?'Express':'Regular'}, bebas ongkir Rp0. Estimasi simulasi: ${data.deliveryMethod==='express'?1:2} menit setelah pembayaran terverifikasi; bukan estimasi kurir nyata.`.slice(0,1000)}});data.expiresAt=new Date(invoice.expiryDate).getTime();if(!Number.isFinite(data.expiresAt))throw Error('Missing expiry');invoiceId=invoice.id||null;url=invoice.invoiceUrl;if(!invoiceId||!url)throw Error('Missing invoice');}
 await db.prepare("UPDATE kopdes_orders SET status = 'PENDING', invoice_id = ?, url = ?, data = ? WHERE id = ? AND owner = ?").bind(invoiceId,url,JSON.stringify(data),id,owner).run();
 }catch{await db.prepare("UPDATE kopdes_orders SET status = 'FAILED' WHERE id = ? AND owner = ?").bind(id,owner).run();return json({error:'Invoice belum dapat dibuat. Periksa Pesanan saya sebelum mencoba lagi.'},502);}
 return json({order:await readOrder(db,owner,id)});
 }catch{return json({error:'Checkout belum berhasil. Alamat dan keranjang tetap tersimpan di layar.'},503);}
}
