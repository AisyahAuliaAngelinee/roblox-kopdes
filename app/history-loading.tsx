'use client';
import {useLanguage} from './language-context';
export default function HistoryLoading(){
 const {t,language,setLanguage}=useLanguage();return <div className="history-loading" role="status" aria-live="polite"><img src="/kopdes-logo.png" width="72" height="72" alt="Logo Kopdes Merah Putih"/><span>{t("Memuat history")}</span><span className="loading-dots" aria-hidden="true">•••</span></div>;}
