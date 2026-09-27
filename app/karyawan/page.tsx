import {Suspense} from 'react';
import Storefront from '../storefront';
export const metadata={title:'Karyawan | Kopdes Merah Putih'};
export default function Staff(){return <Suspense><Storefront view="staff"/></Suspense>;}
