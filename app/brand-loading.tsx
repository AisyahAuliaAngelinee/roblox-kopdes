export default function BrandLoading({label='Memuat…',inline=false}:{label?:string;inline?:boolean}) {
 return <span className={'brand-loading'+(inline?' brand-loading-inline':'')} role="status" aria-live="polite"><img src="/kopdes-logo.png" alt="" width={inline?24:64} height={inline?24:64}/><span>{label}</span></span>;
}
