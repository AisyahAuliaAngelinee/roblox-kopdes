import type {NextConfig} from 'next';
import {initOpenNextCloudflareForDev} from '@opennextjs/cloudflare';
if(process.env.NODE_ENV==='development')initOpenNextCloudflareForDev();
const nextConfig:NextConfig={
 output:'standalone',
 images:{unoptimized:true},
 async headers(){return [{source:'/:path*',headers:[{key:'Cross-Origin-Opener-Policy',value:'same-origin-allow-popups'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}];},
};
export default nextConfig;
