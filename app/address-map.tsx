'use client';
import BrandLoading from './brand-loading';
import {useLanguage} from './language-context';
import {useEffect,useRef,useState} from 'react';
import type {Map as LeafletMap,Marker,Circle} from 'leaflet';
import {LocateFixed,MapPin,Square} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
type Point={lat:number;lng:number};
export default function AddressMap({point,onChange}:{point:Point|null;onChange:(point:Point)=>void}){
 const {t,language,setLanguage}=useLanguage();
 const host=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null),marker=useRef<Marker|null>(null),accuracyCircle=useRef<Circle|null>(null),watch=useRef<number|null>(null),choose=useRef(onChange),position=useRef(point),place=useRef<((p:Point,pan?:boolean,accuracy?:number)=>void)|null>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[tracking,setTracking]=useState(false),[accuracy,setAccuracy]=useState<number|null>(null);
 choose.current=onChange;position.current=point;
 function stop(){if(watch.current!==null){navigator.geolocation.clearWatch(watch.current);watch.current=null;}setTracking(false);}
 useEffect(()=>{let cancelled=false;let observer:ResizeObserver|undefined;
 (async()=>{const L=await import('leaflet');if(cancelled||!host.current)return;
 const m=L.map(host.current,{scrollWheelZoom:false}).setView(position.current?[position.current.lat,position.current.lng]:[-2.5,118],position.current?15:4);map.current=m;
 const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'}).addTo(m);
 tiles.on('tileerror',()=>setError(t("Sebagian peta belum termuat. Periksa koneksi atau isi koordinat manual.")));tiles.on('load',()=>setError(''));
 const icon=L.divIcon({className:'address-pin',html:'<span></span>',iconSize:[30,38],iconAnchor:[15,38]});
 place.current=(p,pan=false,acc)=>{if(!marker.current){marker.current=L.marker([p.lat,p.lng],{icon,draggable:true,keyboard:true,title:t("Titik alamat — seret untuk memindahkan"),alt:t("Titik alamat")}).addTo(m);marker.current.on('dragstart',stop);marker.current.on('dragend',()=>{const v=marker.current!.getLatLng();setAccuracy(null);accuracyCircle.current?.remove();accuracyCircle.current=null;choose.current({lat:v.lat,lng:v.lng});});}else marker.current.setLatLng([p.lat,p.lng]);if(acc){if(!accuracyCircle.current)accuracyCircle.current=L.circle([p.lat,p.lng],{radius:acc,color:'#bc303a',fillOpacity:.08,weight:1}).addTo(m);else accuracyCircle.current.setLatLng([p.lat,p.lng]).setRadius(acc);}if(pan)m.setView([p.lat,p.lng],16);};
 if(position.current)place.current(position.current);m.on('click',e=>{stop();setAccuracy(null);accuracyCircle.current?.remove();accuracyCircle.current=null;const p={lat:e.latlng.lat,lng:e.latlng.lng};place.current?.(p);choose.current(p);});
 observer=new ResizeObserver(()=>m.invalidateSize());observer.observe(host.current);setReady(true);
 })().catch(()=>setError(t("Peta tidak dapat dimuat. Anda tetap dapat menyimpan alamat teks.")));
 return()=>{cancelled=true;if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);observer?.disconnect();map.current?.remove();map.current=null;marker.current=null;accuracyCircle.current=null;place.current=null;};},[]);
 useEffect(()=>{if(point&&place.current)place.current(point);else if(!point&&marker.current){stop();setAccuracy(null);marker.current.remove();marker.current=null;accuracyCircle.current?.remove();accuracyCircle.current=null;}},[point]);
 function locate(){if(tracking){stop();return;}if(!navigator.geolocation){setError(t("Browser tidak mendukung lokasi. Pilih titik secara manual."));return;}setError('');setTracking(true);watch.current=navigator.geolocation.watchPosition(p=>{const v={lat:p.coords.latitude,lng:p.coords.longitude};choose.current(v);place.current?.(v,true,p.coords.accuracy);setAccuracy(Math.round(p.coords.accuracy));},e=>{stop();setError(e.code===1?t("Izin lokasi ditolak. Anda tetap bisa memilih titik di peta."):e.code===3?t("Pencarian lokasi terlalu lama. Coba lagi atau pilih titik manual."):t("Lokasi belum tersedia. Pilih titik di peta."));},{enableHighAccuracy:true,maximumAge:5000,timeout:15000});}
 return <div className="address-map"><div className="map-toolbar"><span><MapPin size={16}/> {t("Titik alamat")}</span><button type="button" className={'locate-button '+(tracking?'tracking':'')} disabled={!ready} onClick={locate}>{tracking?<Square size={14}/>:<LocateFixed size={16}/>} {tracking?t("Hentikan lokasi langsung"):t("Gunakan lokasi saya")}</button></div>{!ready&&!error&&<BrandLoading label={t("Memuat peta…")}/>}<div ref={host} className="leaflet-host" role="region" aria-label={t("Peta untuk memilih titik alamat")}/>{error&&<p className="field-error" role="alert">{error}</p>}<div className="map-help"><span>{tracking?t("Lokasi diperbarui langsung selama panel terbuka."):t("Klik peta atau geser pin. Koordinat juga bisa diisi manual.")}</span>{accuracy!==null&&<b>{t("Akurasi ±")}{accuracy} m</b>}</div><p className="map-privacy">{t("Lokasi hanya diminta setelah Anda menekan tombol. Periksa pin sebelum menyimpan.")}</p></div>
}
