import imageFiles from './catalog-images.json';
export type Product={id:string;name:string;category:string;unit:string;price:number;origin:string;image:string;tag:string;stock:number;packaged:boolean;trending:boolean};
const items:[string,string,string,string,number,string,boolean][]=[
 ['mie-instan','Mie Instan','Sembako','1 bungkus',3500,'https://i.ebayimg.com/images/g/19sAAOSwJppmbW~R/s-l1200.jpg',true],
 ['daun-serai','Daun Serai','Sayur & Buah','1 ikat',5000,'https://down-id.img.susercontent.com/file/fb5ea56c79356beb7123e7a5ff4a085f',false],
 ['air-mineral','Air Mineral','Minuman','600 ml',4000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/MTA-4492431/aqua_aqua_air_mineral_botol_600_ml_full04_ol4hu7bg.webp',true],
 ['roti','Roti','Camilan & Sereal','1 bungkus',18000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/91/MTA-2424781/sari-roti_sari-roti---roti-tawar--370-g-_full03.jpg',true],
 ['wortel','Wortel','Sayur & Buah','500 g',12000,'https://image.astronauts.cloud/product-images/2024/12/wortelberastagi_fbe291a1-daa1-4770-8b7e-f611c6ea1d5a_900x897.jpg',false],
 ['sprite','Sprite','Minuman','390 ml',6500,'https://coreimages.lottemart.co.id/ord/06/1077427000',true],
 ['kentang','Kentang','Sayur & Buah','500 g',15000,'https://fls-a15f1674-59e5-4511-b241-014900a4c8b4.laravel.cloud/products/5540e53e-c224-425c-825f-282ff475e539.webp',false],
 ['sunlight','Sunlight','Rumah Tangga','650 ml',15000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/99/MTA-57532833/unilever_sabun_pencuci_piring_sunlight_650ml_full01_f5735694.jpg',true],
 ['rebo-kuaci','Rebo Kuaci','Camilan & Sereal','140 g',14000,'https://cdn11.bigcommerce.com/s-5wf0xbtgyb/images/stencil/1280x1280/products/7984/23025/IMG_20211106_091911__95717.1740037758.png?c=2',true],
 ['susu-sapi','Susu Sapi','Minuman','1 liter',26000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/MTA-17408192/greenfields_greenfields_fresh_milk_full_cream_1_l_-_100-_fresh_milk_dari_greenfields_farm-_full04_int60493.png',true],
 ['kecap-bango','Kecap Bango','Sembako','620 ml',30000,'https://admin.dimark.id/storage/product/products/image_path/bango-kecap-manis-botol-620-ml_1710475825.jpg',true],
 ['saus-abc','Saus ABC','Sembako','335 ml',18000,'https://i.gojekapi.com/darkroom/gomart-public-production/v2/images/public/images/292e9c6d-a8b5-44bd-8d84-fe551eb2f8dc_ABC-Sambal-Asli-Botol-335-ml.jpg',true],
 ['lemon','Lemon','Sayur & Buah','500 g',18000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/95/MTA-61265831/no-brand_jeruk-lemon-fresh-jeruk-lemon-import-buah-fresh-buah-segar-1-0kg-_full02.jpg',false],
 ['rinso','Rinso','Rumah Tangga','1 bungkus',22000,'https://img.mbizmarket.co.id/products/thumbs/800x800/2023/03/29/e1bfda73f14982f06478f426a0124437.jpg',true],
 ['telur','Telur','Sembako','1 kg',28000,'https://images.unsplash.com/photo-1552418322-3855ef830d11?auto=format&fit=crop&w=900&q=85',false],
 ['anggur','Anggur','Sayur & Buah','500 g',35000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/101/MTA-7246928/bravo_ibaza_fruitsbox_-_buah_anggur_merah_red_globe_import_australia_-_harga_per_1_kg_full06_eeqhx1rj.jpg',false],
 ['sampo-rambut','Sampo Rambut','Perawatan Diri','290 ml',38000,'https://down-id.img.susercontent.com/file/sg-11134201-22100-5v028khsskiv18',true],
 ['sereal-flakes','Sereal Flakes','Camilan & Sereal','1 kotak',32000,'https://cdn.grofers.com/da/cms-assets/cms/product/aa3af0f8-1d49-417b-9462-f18bb120afb9.jpg',true],
 ['minyak','Minyak Goreng','Sembako','1 liter',19000,'https://images.unsplash.com/photo-1676751926100-ae4228ba0da4?auto=format&fit=crop&w=900&q=85',false],
 ['sereal-gandum','Sereal Gandum','Camilan & Sereal','1 kotak',35000,'https://d31f1ehqijlcua.cloudfront.net/n/0/b/a/8/0ba89fcf5019de582b1782fbe9f193c9896be98c_Cereals_237790_04.jpg',true],
 ['indomilk','Indomilk','Minuman','190 ml',6000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/94/MTA-52527108/indomilk_indomilk_uht_milk_190ml_all_varian_-pcs_-_chocolate_full04_s879wp9w.jpg',true],
 ['gentlegen','GentleGen','Rumah Tangga','700 ml',18000,'https://assets.parenttown.com/product_affiliate/products/19599624151725529590.jpg',true],
 ['sereal-buah','Sereal Buah','Camilan & Sereal','1 kotak',38000,'https://i5.walmartimages.com/seo/Kellogg-s-Froot-Loops-Breakfast-Cereal-Kids-Cereal-Family-Breakfast-Original-10-1oz-Box-1-Box_6b241637-82f9-44c6-8f91-41b068b28ec9.f32bf944cdecd9540216829b5065fe76.jpeg',true],
 ['coklat-dilan','Coklat Dilan','Camilan & Sereal','24 g',2500,'https://down-id.img.susercontent.com/file/id-11134207-7ra0i-mbklzysu7hrhce',true],
 ['pembalut','Pembalut','Perawatan Diri','8 pcs',12000,'https://www.mandjur.co.id/cdn/shop/files/Charm-Pembalut-Extra-Comfort-26-cm-8-Pads-NEW-2.webp?v=1762325979',true],
 ['sabun-detol','Sabun Detol','Perawatan Diri','100 g',8000,'https://www.casaharnica.ro/images/produse/medium/8993560024017_m.png',true],
 ['pembersih-toilet','Pembersih Toilet','Rumah Tangga','780 ml',17000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/91/MTA-3533176/vixal_pembersih-porselin-vixal-780ml-green_full02.jpg',true],
 ['pampers','Pampers','Kebutuhan Bayi','S · 48 pcs',110000,'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/MTA-0160579/pampers_pampers-diaper-premium-care-new-baby-tape---s-48_full04.jpg',true],
 ['beras','Beras 5kg','Sembako','5 kg',72000,'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85',false],
 ['bebelove','Bebelove','Kebutuhan Bayi','800 g',135000,'https://tokokamas.id/storage/app/public/product/2026-01-07-695e11b5546d1.webp',true],
];
export const categories=['Semua Produk','Sembako','Sayur & Buah','Minuman','Camilan & Sereal','Rumah Tangga','Perawatan Diri','Kebutuhan Bayi'];
export const products:Product[]=items.map(([id,name,category,unit,price,image,packaged])=>({id,name,category,unit,price,image:(imageFiles as Record<string,string>)[id]||image,packaged,origin:category==='Sayur & Buah'?'Hasil Tani':'Gerai Koperasi',tag:category,stock:40,trending:['mie-instan','telur','beras','minyak','indomilk','sunlight'].includes(id)}));
export const rupiah=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
