import {getCloudflareContext} from '@opennextjs/cloudflare';
export function getDb():D1Database {
 const {env}=getCloudflareContext();
 const db=(env as unknown as {DB?:D1Database}).DB;
 if(!db)throw new Error('Database unavailable');
 return db;
}
