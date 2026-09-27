import {getUser} from './auth';
export async function orderOwner(request:Request){const user=await getUser(request);return {owner:user?'google:'+user.id:null,user};}
