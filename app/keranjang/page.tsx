import {Suspense} from 'react';
import Storefront from '../storefront';
export const metadata={title:'Keranjang | Kopdes Merah Putih'};
export default function Page(){return <Suspense><Storefront view="cart"/></Suspense>;}
