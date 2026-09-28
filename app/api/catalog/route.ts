import {getDb} from '@/db';
import {readProducts} from '@/db/managed-store';
import {json} from '@/lib/auth';
export async function GET(){try{return json({products:await readProducts(getDb())});}catch{return json({error:'Katalog belum dapat dimuat.'},503);}}
