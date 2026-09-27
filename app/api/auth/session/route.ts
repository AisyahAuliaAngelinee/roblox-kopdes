import {getUser,json,sameOrigin,cookie,SESSION} from '@/lib/auth';
export async function GET(request:Request){return json({user:await getUser(request)});}
export async function DELETE(request:Request){if(!sameOrigin(request))return json({error:'Permintaan tidak diizinkan.'},403);return json({user:null},200,{'Set-Cookie':cookie(request,SESSION,'',0)});}
