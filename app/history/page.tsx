import {Suspense} from 'react';
import Storefront from '../storefront';
export const metadata={title:'History Pembelian | Kopdes Merah Putih'};
export default function History(){return <Suspense><Storefront view="history"/></Suspense>;}
