// Local integration checks. Requires `npm run dev` and applied D1 migrations.
import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const base='http://localhost:5173',invite=randomBytes(32).toString('hex'),id='qa-'+Date.now(),email=id+'@example.test';
const sqlPath='/tmp/kopdes-admin-qa.sql';
fs.writeFileSync(sqlPath,`INSERT INTO kopdes_admin_invites(hash,expires_at,created_by) VALUES('${createHash('sha256').update(invite).digest('hex')}',${Date.now()+600000},'local-test');`);
execFileSync('npx',['wrangler','d1','execute','DB','--local','--config','wrangler.json','--file',sqlPath],{stdio:'ignore'});fs.unlinkSync(sqlPath);
let session='';async function req(path,method='GET',body,auth=true,origin=base){const r=await fetch(base+path,{method,headers:{origin,'Content-Type':'application/json',...(auth&&session?{cookie:session}:{})},body:body?JSON.stringify(body):undefined});return {r,d:await r.json()};}
for(const path of ['products','staff','analytics'])assert.equal((await req('/api/admin/'+path)).r.status,401);
assert.equal((await req('/api/admin/invites','POST',{})).r.status,401);
assert.equal((await req('/api/admin/register','POST',{name:'QA',email,password:'local-test-password-2026',invite:'x'.repeat(64)})).r.status,400);
const registered=await req('/api/admin/register','POST',{name:'Local QA',email,password:'local-test-password-2026',invite});assert.equal(registered.r.status,201,JSON.stringify(registered.d));session=registered.r.headers.get('set-cookie').split(';')[0];assert.match(registered.r.headers.get('set-cookie'),/HttpOnly/);
assert.equal((await req('/api/admin/register','POST',{name:'QA Other',email:'other-'+email,password:'local-test-password-2026',invite})).r.status,400);
assert.equal((await req('/api/admin/products','POST',{},true,'https://evil.example')).r.status,403);
const products=(await req('/api/admin/products')).d.products;assert.ok(products.length>=30);
const product={id,name:'QA Product',category:'Sembako',unit:'1 pcs',price:9000,stock:12,image:'/kopdes-logo.png',origin:'QA',tag:'Sembako',packaged:true,trending:true};
assert.equal((await req('/api/admin/products','POST',{product})).r.status,200);
assert.ok((await req('/api/catalog')).d.products.find(p=>p.id===id&&p.stock===12&&p.trending));
assert.equal((await req('/api/admin/products','PUT',{product:{...product,stock:0,trending:false},version:0})).r.status,200);
assert.equal((await req('/api/admin/products','PUT',{product,version:0})).r.status,409);
assert.ok((await req('/api/catalog')).d.products.find(p=>p.id===id&&p.stock===0&&!p.trending));
assert.equal((await req('/api/admin/products','POST',{product:{...product,id:id+'bad',image:'javascript:alert(1)'}})).r.status,400);
const original=(await req('/api/admin/staff')).d;const updated=original.staff.map((s,i)=>i===0?{...s,role:'QA Manager',active:false}:s);assert.equal((await req('/api/admin/staff','PUT',{staff:updated,version:original.version})).r.status,200);assert.ok(!(await req('/api/staff')).d.staff.some(s=>s.id===updated[0].id));assert.equal((await req('/api/admin/staff','PUT',{staff:updated,version:original.version})).r.status,409);assert.equal((await req('/api/admin/staff','PUT',{staff:original.staff,version:original.version+1})).r.status,200);
const orderData={items:[{id,name:'QA Product',category:'Sembako',quantity:120,price:9000}],amount:1080000,mode:'demo'};
fs.writeFileSync(sqlPath,`INSERT INTO kopdes_orders(id,owner,data,status,paid_at,created_at) VALUES('${id}','local-qa','${JSON.stringify(orderData)}','PAID',${Date.now()},${Date.now()});`);execFileSync('npx',['wrangler','d1','execute','DB','--local','--config','wrangler.json','--file',sqlPath],{stdio:'ignore'});fs.unlinkSync(sqlPath);
const analytics=(await req('/api/admin/analytics?mode=demo')).d;assert.equal(analytics.days.length,30);assert.ok(analytics.units>=120);assert.ok(analytics.summary.revenue>=1080000);assert.ok(analytics.topProducts.length<=5);assert.ok(!(await req('/api/admin/analytics?mode=xendit-test')).d.topProducts.some(p=>p.id===id));
assert.equal((await req('/api/admin/invites','POST',{})).d.code.length,64);
assert.equal((await req('/api/admin/session','DELETE')).r.status,200);assert.equal((await req('/api/admin/products')).r.status,401);
assert.equal((await req('/api/admin/login','POST',{email,password:'wrong'})).r.status,401);
assert.equal((await req('/api/admin/login','POST',{email,password:'local-test-password-2026'})).r.status,200);
console.log('PASS: auth boundary, single-use invitation, CSRF, catalog persistence, version conflicts, staff visibility, sales aggregation/mode isolation, logout and password verification.');
const {SignJWT}=await import('jose');
const secret=fs.readFileSync('.dev.vars','utf8').match(/^SESSION_SECRET=["']?([^\n"']+)/m)?.[1];assert.ok(secret,'Local SESSION_SECRET required');
const googleToken=await new SignJWT({name:'QA Buyer',email:'buyer@example.test'}).setProtectedHeader({alg:'HS256'}).setSubject(id).setIssuer('kopdes').setAudience('kopdes-web').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(secret));
const buyerHeaders={origin:base,'content-type':'application/json',cookie:'kopdes_session='+googleToken};
assert.equal((await fetch(base+'/api/admin/products',{headers:buyerHeaders})).status,401);
const address={label:'QA',recipient:'QA Buyer',phone:'081234567890',street:'Jalan Test 1',village:'Test',city:'Jakarta',postalCode:'12345',notes:'',lat:null,lng:null};
const checkout={paymentMethod:'qris',deliveryMethod:'regular',address,items:[{id,quantity:1}]};
assert.equal((await fetch(base+'/api/checkout',{method:'POST',headers:buyerHeaders,body:JSON.stringify(checkout)})).status,400);
const login=await req('/api/admin/login','POST',{email,password:'local-test-password-2026'});session=login.r.headers.get('set-cookie').split(';')[0];assert.equal((await req('/api/admin/products','PUT',{product:{...product,stock:5,price:12345},version:1})).r.status,200);
const orderResponse=await fetch(base+'/api/checkout',{method:'POST',headers:buyerHeaders,body:JSON.stringify(checkout)});const order=await orderResponse.json();assert.equal(orderResponse.status,200,JSON.stringify(order));assert.equal(order.order.data.amount,12345);assert.equal(order.order.data.items[0].category,'Sembako');
const newInvite=(await req('/api/admin/invites','POST',{})).d.code;
const concurrent=await Promise.all([1,2].map(n=>req('/api/admin/register','POST',{name:'Concurrent QA',email:id+'-'+n+'@example.test',password:'local-test-password-2026',invite:newInvite})));assert.equal(concurrent.filter(x=>x.r.status===201).length,1);
console.log('PASS: customer cannot administer; checkout uses managed stock/price/category; concurrent invitation accepted once.');

if(order.order.data.mode==='demo'){
 const paid=await Promise.all(Array.from({length:3},()=>fetch(base+'/api/orders',{method:'POST',headers:buyerHeaders,body:JSON.stringify({id:order.order.id,action:'simulate'})})));
 assert.ok(paid.every(r=>r.status===200));
 const catalog=(await req('/api/catalog')).d.products;
 assert.equal(catalog.find(p=>p.id===id).stock,4);
 assert.equal((await req('/api/admin/products','PUT',{product:{...product,stock:5},version:2})).r.status,409);
 console.log('PASS: payment API debits stock once; stale admin edits cannot overwrite the debit.');
}
