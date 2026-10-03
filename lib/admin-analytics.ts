const DAY=86400000,OFFSET=25200000;
export const dateWIB=(at:number)=>new Date(at+OFFSET).toISOString().slice(0,10);
const midnight=(day:string)=>Date.parse(day+'T00:00:00+07:00');
export function periodBounds(period:string,now:number,from?:string|null,to?:string|null){
 const today=dateWIB(now),startToday=midnight(today);let start=startToday,end=startToday+DAY;
 if(period==='all')return {start:0,end};
 if(period==='weekly'){start-=((new Date(startToday+OFFSET).getUTCDay()+6)%7)*DAY;end=start+7*DAY;}
 else if(period==='monthly'){start=midnight(today.slice(0,7)+'-01');const d=new Date(start+OFFSET);d.setUTCMonth(d.getUTCMonth()+1);end=midnight(d.toISOString().slice(0,10));}
 else if(period==='yearly'){start=midnight(today.slice(0,4)+'-01-01');end=midnight((Number(today.slice(0,4))+1)+'-01-01');}
 else if(period==='range'){const valid=(v?:string|null)=>!!v&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&dateWIB(midnight(v))===v;if(!valid(from)||!valid(to))throw Error('Pilih tanggal mulai dan akhir yang valid.');start=midnight(from!);end=midnight(to!)+DAY;if(start>=end)throw Error('Tanggal akhir harus setelah atau sama dengan tanggal mulai.');}
 else if(period!=='daily')start=end-30*DAY;
 return {start,end};
}
export type AnalyticsRow={id:string;status:string;created_at:number;paid_at:number|null;data:string};
export function aggregateAnalytics(rows:AnalyticsRow[],options:{period:string;barPeriod:string;category:string;status:string;from?:string|null;to?:string|null},now=Date.now()){
 const range=periodBounds(options.period,now,options.from,options.to),barRange=periodBounds(options.barPeriod,now);
 const parsed=rows.map(o=>({...o,data:JSON.parse(o.data),at:o.paid_at??o.created_at}));
 const scoped=parsed.filter(o=>options.category==='all'||o.data.items.some((i:any)=>i.category===options.category));
 const paid=(o:AnalyticsRow)=>o.status==='PAID'||o.status==='COMPLETED';
 const failed=(o:any)=>['FAILED','EXPIRED','CANCELLED'].includes(o.status)||(o.status==='PENDING'&&(o.data.expiresAt??o.created_at+DAY)<=now);
 const matches=(o:any)=>options.status==='all'||(options.status==='completed'?o.status==='COMPLETED':options.status==='failed'?failed(o):o.status==='PAID');
 const selected=scoped.filter(o=>o.at>=range.start&&o.at<range.end&&matches(o));
 const sales=selected.filter(paid),pt=new Map<string,{id:string;name:string;quantity:number}>(),ct=new Map<string,number>();
 const items=(o:any)=>o.data.items.filter((i:any)=>options.category==='all'||i.category===options.category);
 let revenue=0;for(const o of sales)for(const i of items(o)){const old=pt.get(i.id);pt.set(i.id,{id:i.id,name:i.name,quantity:(old?.quantity||0)+i.quantity});ct.set(i.category||'Lainnya',(ct.get(i.category||'Lainnya')||0)+i.quantity);revenue+=i.price*i.quantity;}
 const topProducts=[...pt.values()].sort((a,b)=>b.quantity-a.quantity).slice(0,5),topCategories=[...ct].map(([name,quantity])=>({name,quantity})).sort((a,b)=>b.quantity-a.quantity).slice(0,5);
 const start=options.period==='all'?midnight(dateWIB(Math.min(...selected.map(o=>o.at),range.end-DAY))):range.start;
 const monthly=range.end-start>366*DAY;const keys:string[]=[];
 if(monthly){const d=new Date(start+OFFSET);d.setUTCDate(1);while(d.getTime()-OFFSET<range.end){keys.push(d.toISOString().slice(0,7));d.setUTCMonth(d.getUTCMonth()+1);}}
 else for(let at=start;at<range.end;at+=DAY)keys.push(dateWIB(at));
 const days=keys.map(day=>{const orders=sales.filter(o=>dateWIB(o.at).slice(0,monthly?7:10)===day);const flat=orders.flatMap(items);return {day,...Object.fromEntries(topProducts.map((p,i)=>['p'+i,flat.filter((r:any)=>r.id===p.id).reduce((s:number,r:any)=>s+r.quantity,0)])),...Object.fromEntries(topCategories.map((c,i)=>['c'+i,flat.filter((r:any)=>(r.category||'Lainnya')===c.name).reduce((s:number,r:any)=>s+r.quantity,0)]))};});
 const statusBars=[];for(let at=barRange.start;at<barRange.end;){const key=dateWIB(at).slice(0,options.barPeriod==='yearly'?7:10),next=options.barPeriod==='yearly'?midnight(new Date(Date.UTC(Number(key.slice(0,4)),Number(key.slice(5,7)),1)).toISOString().slice(0,10)):at+DAY;const orders=scoped.filter(o=>o.at>=at&&o.at<next);statusBars.push({day:key,success:orders.filter(paid).length,failed:orders.filter(failed).length});at=next;}
 return {summary:{orders:sales.length,revenue,matchingOrders:selected.length},units:[...pt.values()].reduce((s,p)=>s+p.quantity,0),topProducts,topCategories,days,statusBars,granularity:monthly?'monthly':'daily'};
}
