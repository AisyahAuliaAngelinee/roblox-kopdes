import type {Address} from './profile';
export type OrderData={mode:'demo'|'xendit-test';email:string|null;items:{id:string;name:string;price:number;quantity:number}[];amount:number;address:Address;shipping:number;paymentMethod?:'qris'|'gopay'|'bank';bankCode?:string;note?:string;expiresAt?:number;deliveryMethod?:'express'|'regular'};
export type Order={id:string;status:string;createdAt:number;paidAt:number|null;completedAt:number|null;invoiceId:string|null;url:string|null;data:OrderData};
export const deliveryStages=['Barang sedang di packing','Barang sedang di antar dalam perjalanan','Barang sampai di tujuan'];
export function deliveryTiming(method?:string){return method==='express'?{label:'Express',packing:15000,total:60000}:{label:'Regular',packing:30000,total:120000};}
export function deliveryStage(paidAt:number|null,now=Date.now(),method?:string){const timing=deliveryTiming(method);return paidAt===null?-1:now-paidAt>=timing.total?2:now-paidAt>=timing.packing?1:0;}

export const paymentLabels={qris:'QRIS',gopay:'GoPay (via QRIS)',bank:'Transfer bank'};
export function paymentDeadline(order:Order){return order.data.expiresAt??order.createdAt+(order.data.mode==='demo'?86400000:3600000);}
export function dateBoundary(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const utc=Date.parse(value+'T00:00:00Z');return Number.isFinite(utc)&&new Date(utc).toISOString().slice(0,10)===value?utc-7*3600000:NaN;}
