import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {readProfile,writeProfile} from '../db/profile-store.ts';
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'test-kopdes-profiles'}});
try{
 const db=await mf.getD1Database('DB');
 await db.exec(await fs.readFile(new URL('../drizzle/0000_luxuriant_mentallo.sql',import.meta.url),'utf8').then(x=>x.replace(/\n/g,' ')));
 assert.equal(await readProfile(db,'user-a'),null);
 assert.equal(await writeProfile(db,'user-a',JSON.stringify({favorites:['beras'],address:null}),0),1);
 assert.deepEqual(JSON.parse((await readProfile(db,'user-a')).data).favorites,['beras']);
 assert.equal(await readProfile(db,'user-b'),null);
 assert.equal(await writeProfile(db,'user-b',JSON.stringify({favorites:['telur'],address:null}),0),1);
 assert.equal(await writeProfile(db,'user-a','{"favorites":[],"address":null}',0),null);
 assert.deepEqual(JSON.parse((await readProfile(db,'user-a')).data).favorites,['beras']);
 const results=await Promise.all([writeProfile(db,'user-a','{"favorites":["kopi"],"address":null}',1),writeProfile(db,'user-a','{"favorites":["minyak"],"address":null}',1)]);
 assert.equal(results.filter(v=>v===2).length,1);
 assert.equal(results.filter(v=>v===null).length,1);
 assert.deepEqual(JSON.parse((await readProfile(db,'user-b')).data).favorites,['telur']);
 console.log('PASS: profile persistence, user isolation, stale updates rejected, concurrent updates protected.');
}finally{await mf.dispose();}
