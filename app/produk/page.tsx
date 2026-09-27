import {Suspense} from 'react';
import Storefront from '../storefront';
export const metadata={title:'Produk Desa | Kopdes Merah Putih'};
export default function Products(){return <Suspense><Storefront view="products"/></Suspense>;}
