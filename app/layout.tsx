import type { Metadata } from 'next';
import './globals.css';
import {ColorThemeProvider} from './theme-toggle';
import {LanguageProvider} from './language-context';
import {CartProvider} from './cart-context';
import {AccountProvider} from './account-context';
export const metadata:Metadata={title:'Kopdes Merah Putih — Dari desa, untuk kita.',description:'Belanja produk desa, jelajahi koperasi 3D. Prototipe kreatif terinspirasi dunia Roblox.',icons:{icon:'/kopdes-logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id" suppressHydrationWarning><body><ColorThemeProvider><LanguageProvider><AccountProvider><CartProvider>{children}</CartProvider></AccountProvider></LanguageProvider></ColorThemeProvider></body></html>}
