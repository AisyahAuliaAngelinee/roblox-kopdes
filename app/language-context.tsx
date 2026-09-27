'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import dictionary from '@/lib/translations.json';
type Language='id'|'en';
const Context=createContext({language:'id' as Language,setLanguage:(_value:Language)=>{},t:(value:string)=>value});
export function LanguageProvider({children}:{children:React.ReactNode}){const [language,setValue]=useState<Language>('id');useEffect(()=>{try{if(localStorage.getItem('kopdes-language')==='en')setValue('en');}catch{}},[]);useEffect(()=>{document.documentElement.lang=language;},[language]);function setLanguage(value:Language){setValue(value);try{localStorage.setItem('kopdes-language',value);}catch{}}const t=(value:string)=>language==='en'?(dictionary as Record<string,string>)[value]??value:value;return <Context.Provider value={{language,setLanguage,t}}>{children}</Context.Provider>;}
export const useLanguage=()=>useContext(Context);
