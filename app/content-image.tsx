'use client';
import {useRef,useEffect,useState} from 'react';
import {UserRound} from 'lucide-react';
import {Skeleton} from '@/components/ui/skeleton';
import {useLanguage} from './language-context';
export default function ContentImage({src,alt,kind='product',className='',imageClassName=''}:{src?:string;alt:string;kind?:'product'|'staff';className?:string;imageClassName?:string}){
 return <ImageState key={src||'empty'} src={src} alt={alt} kind={kind} className={className} imageClassName={imageClassName}/>;
}
function ImageState({src,alt,kind,className,imageClassName}:{src?:string;alt:string;kind:'product'|'staff';className:string;imageClassName:string}){
 const {language}=useLanguage();const image=useRef<HTMLImageElement>(null);
 const [state,setState]=useState<'loading'|'ready'|'error'>(src?'loading':'error');
 useEffect(()=>{if(image.current?.complete)setState(image.current.naturalWidth?'ready':'error');},[]);
 const message=kind==='staff'?(language==='en'?'User photo unavailable':'Foto pengguna tidak tersedia'):(language==='en'?'Image unavailable':'Gambar tidak tersedia');
 return <div className={'content-image '+className} aria-busy={state==='loading'}>
 {state==='loading'&&<Skeleton className="content-image-skeleton" role="status" aria-label={language==='en'?'Loading image':'Memuat gambar'}/>}
 {state==='error'?<div className={'content-image-fallback '+kind} role="img" aria-label={alt+' — '+message}>{kind==='staff'?<UserRound aria-hidden="true"/>:<img src="/kopdes-logo.png" alt=""/>}<span>{message}</span></div>:<img ref={image} className={'content-image-photo '+imageClassName} src={src} alt={alt} loading="lazy" style={{opacity:state==='ready'?1:0}} onLoad={()=>setState('ready')} onError={()=>setState('error')}/>}
 </div>;
}
