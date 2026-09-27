'use client';
import {useState} from 'react';
import {Package} from 'lucide-react';
export default function ProductImage({src,name,packaged=false}:{src?:string;name:string;packaged?:boolean}){
 const [failed,setFailed]=useState(false);
 if(!src||failed)return <div className="product-image-unavailable"><Package size={36}/><span>{name}</span><small>Foto belum tersedia</small></div>;
 return <img className={packaged?'packaged-photo':''} src={src} alt={name} loading="lazy" onError={()=>setFailed(true)}/>;
}
