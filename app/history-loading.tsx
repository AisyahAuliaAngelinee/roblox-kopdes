'use client';
import BrandLoading from './brand-loading';
import {useLanguage} from './language-context';
export default function HistoryLoading(){const {t}=useLanguage();return <BrandLoading label={t('Memuat history')}/>;}
