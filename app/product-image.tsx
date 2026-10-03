'use client';
import ContentImage from './content-image';
export default function ProductImage({src,name,packaged=false}:{src?:string;name:string;packaged?:boolean}){
 return <ContentImage src={src} alt={name} imageClassName={packaged?'packaged-photo':''}/>;
}
