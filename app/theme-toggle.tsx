'use client';
import {useEffect,useState} from 'react';
import {ThemeProvider,useTheme} from 'next-themes';
import {Moon,Sun} from 'lucide-react';
import {useLanguage} from './language-context';
export function ColorThemeProvider({children}:{children:React.ReactNode}){return <ThemeProvider attribute="class" storageKey="kopdes-theme" defaultTheme="light" enableSystem={false} disableTransitionOnChange>{children}</ThemeProvider>;}
export default function ThemeToggle(){const {resolvedTheme,setTheme}=useTheme();const {language}=useLanguage();const [ready,setReady]=useState(false);useEffect(()=>setReady(true),[]);const dark=ready&&resolvedTheme==='dark';const label=language==='id'?'Mode gelap':'Dark mode';return <button type="button" className="theme-toggle" role="switch" aria-checked={dark} aria-label={label} title={language==='id'?(dark?'Gunakan mode terang':'Gunakan mode gelap'):(dark?'Use light mode':'Use dark mode')} disabled={!ready} onClick={()=>setTheme(dark?'light':'dark')}><span className={!dark?'active':''}><Sun size={16}/></span><span className={dark?'active':''}><Moon size={16}/></span></button>;}
