'use client';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {emptyProfile,profileSchema,type Profile,type User} from '@/lib/profile';
import {toast} from 'sonner';
const GUEST_KEY='kopdes-guest-profile-v1';
function guestProfile():Profile{try{return profileSchema.parse(JSON.parse(localStorage.getItem(GUEST_KEY)||'null'));}catch{return {...emptyProfile};}}
type Account={user:User|null;profile:Profile;loading:boolean;saving:boolean;loadError:string;refresh:()=>Promise<void>;save:(next:Profile)=>Promise<boolean>;logout:()=>Promise<void>};
const Context=createContext<Account|null>(null);
export function AccountProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<Profile>(emptyProfile),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[loadError,setLoadError]=useState('');
 const version=useRef(0),lock=useRef(false);
 async function refresh(){setLoading(true);setLoadError('');try{const r=await fetch('/api/auth/session');if(!r.ok)throw new Error('Akun belum dapat dimuat. Coba muat ulang.');const data:any=await r.json();setUser(data.user);if(data.user){const pr=await fetch('/api/profile');const pd:any=await pr.json();if(!pr.ok)throw new Error(pd.error);setProfile(profileSchema.parse(pd.profile));version.current=pd.version;}else{setProfile(guestProfile());version.current=0;}}catch(e){setLoadError(e instanceof Error?e.message:'Akun belum dapat dimuat.');setProfile(emptyProfile);}finally{setLoading(false);}}
 useEffect(()=>{void refresh();const sync=()=>{void refresh();};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 async function save(next:Profile){if(lock.current||loading||loadError)return false;const validated=profileSchema.safeParse(next);if(!validated.success){toast.error('Periksa kembali data yang diisi.');return false;}lock.current=true;setSaving(true);try{if(user){const r=await fetch('/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:validated.data,version:version.current})});const data:any=await r.json();if(!r.ok)throw new Error(data.error);setProfile(data.profile);version.current=data.version;}else{localStorage.setItem(GUEST_KEY,JSON.stringify(validated.data));setProfile(validated.data);}return true;}catch(e){toast.error(e instanceof Error?e.message:'Gagal menyimpan. Periksa pengaturan penyimpanan browser.');return false;}finally{lock.current=false;setSaving(false);}}
 async function logout(){if(lock.current)return;lock.current=true;setSaving(true);try{const r=await fetch('/api/auth/session',{method:'DELETE'});if(!r.ok)throw new Error('Belum berhasil keluar. Coba lagi.');setUser(null);setProfile(guestProfile());version.current=0;setLoadError('');toast.success('Anda sudah keluar.');}catch(e){toast.error((e as Error).message);}finally{lock.current=false;setSaving(false);}}
 return <Context.Provider value={{user,profile,loading,saving,loadError,refresh,save,logout}}>{children}</Context.Provider>;
}
export function useAccount(){const value=useContext(Context);if(!value)throw new Error('Account provider missing');return value;}
