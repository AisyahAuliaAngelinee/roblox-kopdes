'use client';
import {useState} from 'react';
import {UserRound} from 'lucide-react';
import type {User} from '@/lib/profile';
export default function UserAvatar({user,size=28}:{user:User|null;size?:number}){
 const [failed,setFailed]=useState<string|null>(null);
 return user?.picture&&failed!==user.picture?<img className="user-avatar" src={user.picture} width={size} height={size} alt={'Foto profil '+user.name} referrerPolicy="no-referrer" onError={()=>setFailed(user.picture!)}/>:<UserRound size={size}/>;
}
