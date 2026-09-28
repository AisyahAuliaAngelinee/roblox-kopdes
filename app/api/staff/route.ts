import {getDb} from '@/db';
import {readStaff} from '@/db/managed-store';
import {json} from '@/lib/auth';
export async function GET(){try{const {staff}=await readStaff(getDb());return json({staff:staff.filter(p=>p.active)});}catch{return json({error:'Karyawan belum dapat dimuat.'},503);}}
