export type StoredProfile={data:string;version:number};
export async function readProfile(db:D1Database,userId:string){
 return db.prepare('SELECT data, version FROM kopdes_profiles WHERE user_id = ?').bind(userId).first<StoredProfile>();
}
export async function writeProfile(db:D1Database,userId:string,data:string,version:number){
 const now=Date.now();
 const results=await db.batch([
  db.prepare('INSERT INTO kopdes_profiles (user_id, data, version, updated_at) VALUES (?, ?, 0, ?) ON CONFLICT(user_id) DO NOTHING').bind(userId,'{"favorites":[],"address":null}',now),
  db.prepare('UPDATE kopdes_profiles SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND version = ? RETURNING version').bind(data,now,userId,version)
 ]);
 return (results[1].results[0] as {version:number}|undefined)?.version??null;
}
