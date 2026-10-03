import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {insertOrder,markPaid,payDemoOrder,readOrder,completeOrder} from '../db/order-store.ts';
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'inventory-tests'}});
try {
 const db=await mf.getD1Database('DB');
 for(const path of ['drizzle/0001_chief_warhawk.sql','drizzle/0002_sad_marvel_apes.sql','drizzle/0004_clammy_magus.sql'])for(const sql of (await fs.readFile(path,'utf8')).split('--> statement-breakpoint'))await db.exec(sql.replace(/\n/g,' '));
 const stock=async id=>JSON.parse((await db.prepare('SELECT data FROM kopdes_products WHERE id=?').bind(id).first()).data).stock;
 async function product(id,n){await db.prepare('INSERT INTO kopdes_products VALUES(?,?,0,0)').bind(id,JSON.stringify({stock:n})).run();}
 async function order(id,items,mode='demo',expiresAt=9999999999999){await insertOrder(db,'buyer',id,{mode,items,expiresAt});await db.prepare("UPDATE kopdes_orders SET status='PENDING' WHERE id=?").bind(id).run();}
 await product('a',10);await product('b',7);
 await order('one',[{id:'a',quantity:2},{id:'a',quantity:1},{id:'b',quantity:2}]);
 await Promise.all(Array.from({length:6},()=>payDemoOrder(db,'buyer','one',1000)));
 assert.equal(await stock('a'),7);assert.equal(await stock('b'),5);
 assert.equal((await readOrder(db,'buyer','one')).paidAt,1000);
 assert.equal((await db.prepare("SELECT version FROM kopdes_products WHERE id='a'").first()).version,1);
 await completeOrder(db,'buyer','one',200000);await markPaid(db,'buyer','one',200001);assert.equal(await stock('a'),7);
 await order('other',[{id:'a',quantity:2}]);await payDemoOrder(db,'stranger','other',1000);assert.equal(await stock('a'),7);
 await order('expired',[{id:'a',quantity:2}],'demo',999);await payDemoOrder(db,'buyer','expired',1000);assert.equal(await stock('a'),7);
 await product('last',3);await order('race1',[{id:'last',quantity:2}]);await order('race2',[{id:'last',quantity:2}]);
 const results=await Promise.all(['race1','race2'].map(id=>payDemoOrder(db,'buyer',id,1000)));assert.equal(results.filter(Boolean).length,1);assert.equal(await stock('last'),1);
 await order('provider',[{id:'last',quantity:3}],'xendit-test');await markPaid(db,'buyer','provider',1000);await markPaid(db,'buyer','provider',2000);
 assert.equal(await stock('last'),0);const paid=await readOrder(db,'buyer','provider');assert.equal(paid.status,'PAID');assert.equal(paid.data.inventoryShortages[0].shortfall,2);
 await product('rollback',5);await order('rollback-order',[{id:'rollback',quantity:2}]);
 await db.exec("CREATE TRIGGER force_inventory_failure BEFORE UPDATE ON kopdes_products WHEN old.id='rollback' BEGIN SELECT RAISE(ABORT,'test failure'); END");
 await assert.rejects(()=>payDemoOrder(db,'buyer','rollback-order',1000));assert.equal(await stock('rollback'),5);assert.equal((await readOrder(db,'buyer','rollback-order')).status,'PENDING');
 console.log('PASS: stock totals, duplicate line aggregation, concurrent duplicate confirmation, ownership, expiry, sold-out race, provider shortage, completion, and transaction rollback.');
}finally{await mf.dispose();}
