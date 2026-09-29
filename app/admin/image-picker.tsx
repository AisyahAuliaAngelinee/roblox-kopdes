'use client';
import {useId,useRef,useState} from 'react';
import {ImagePlus,Upload,Link as LinkIcon,LoaderCircle,CheckCircle2} from 'lucide-react';
import {MAX_IMAGE_BYTES} from '@/lib/image-upload';
export default function ImagePicker({value,onChange,onBusyChange,label='Gambar'}:{value:string;onChange:(value:string)=>void;onBusyChange:(busy:boolean)=>void;label?:string}) {
 const id=useId(),input=useRef<HTMLInputElement>(null);
 const [mode,setMode]=useState<'file'|'url'>('file'),[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false);
 async function save(file?:File) {
  if(busy)return;
  setError('');setSuccess(false);
  if(file&&(!/\.(png|jpe?g)$/i.test(file.name)||!['image/png','image/jpeg'].includes(file.type))) {setError('Pilih file PNG, JPG, atau JPEG.');return;}
  if(file&&file.size>MAX_IMAGE_BYTES) {setError('Ukuran gambar maksimal 12 MB.');return;}
  if(!file&&!url.trim()){setError('Masukkan URL gambar terlebih dahulu.');return;}
  setBusy(true);onBusyChange(true);
  try {
   if(file){const bitmap=await createImageBitmap(file);bitmap.close();}
   const response=await fetch('/api/admin/images',{method:'POST',headers:{'Content-Type':file?file.type:'application/json'},body:file||JSON.stringify({url:url.trim()})});
   const data=await response.json() as {url:string;error?:string};if(!response.ok)throw Error(data.error||'Gambar belum dapat diunggah.');
   onChange(data.url);setSuccess(true);setUrl('');
  }catch(e){setError(e instanceof Error?e.message:'Gambar tidak dapat dibaca.');}
  finally{setBusy(false);onBusyChange(false);if(input.current)input.current.value='';}
 }
 return <fieldset className="image-picker" disabled={busy}><legend>{label}</legend><div className="image-picker-layout"><div className="image-picker-preview">{value?<img src={value} alt={'Pratinjau '+label.toLowerCase()}/>:<ImagePlus aria-hidden="true"/>}</div><div className="image-picker-controls"><div className="image-picker-tabs" role="group" aria-label="Sumber gambar"><button type="button" aria-pressed={mode==='file'} onClick={()=>setMode('file')}><Upload size={16}/>Upload file</button><button type="button" aria-pressed={mode==='url'} onClick={()=>setMode('url')}><LinkIcon size={16}/>Link URL</button></div>{mode==='file'?<><input ref={input} id={id} className="image-file-input" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={e=>{if(e.target.files?.[0])void save(e.target.files[0]);}}/><button className="outline image-choose" type="button" onClick={()=>input.current?.click()}><Upload size={17}/>{value?'Ganti gambar':'Pilih gambar'}</button></>:<div className="image-url-row"><label htmlFor={id+'-url'} className="sr-only">URL gambar HTTPS</label><input id={id+'-url'} type="url" value={url} placeholder="https://contoh.com/foto.jpg" maxLength={2000} onChange={e=>setUrl(e.target.value)}/><button type="button" className="outline" onClick={()=>void save()}>Gunakan</button></div>}<p className="image-picker-hint">PNG, JPG, JPEG · maksimal 12 MB</p><p className="image-picker-status" role="status">{busy?<><LoaderCircle className="image-spinner" size={16}/>Menyimpan gambar…</>:success?<><CheckCircle2 size={16}/>Gambar siap. Simpan perubahan untuk menayangkannya.</>:null}</p>{error&&<p className="error" role="alert">{error}</p>}</div></div></fieldset>;
}
