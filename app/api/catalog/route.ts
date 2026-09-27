import {products} from '@/lib/catalog';
export async function GET(){return Response.json({products},{headers:{'Cache-Control':'no-store'}});}
