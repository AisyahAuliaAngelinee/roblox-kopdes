import { z } from 'zod';
import { products } from './catalog';
export const addressSchema=z.object({label:z.string().trim().min(1).max(40),recipient:z.string().trim().min(2).max(100),phone:z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/,'Nomor telepon tidak valid'),street:z.string().trim().min(5).max(500),village:z.string().trim().min(2).max(100),city:z.string().trim().min(2).max(100),postalCode:z.string().regex(/^\d{5}$/,'Kode pos harus 5 angka'),notes:z.string().trim().max(300),lat:z.number().min(-90).max(90).nullable(),lng:z.number().min(-180).max(180).nullable()}).strict().refine(a=>(a.lat===null)===(a.lng===null),'Koordinat tidak lengkap');
const savedAddressSchema=z.object({id:z.string().min(1).max(80),address:addressSchema}).strict();
export const profileSchema=z.object({favorites:z.array(z.string()).max(1000).transform(v=>[...new Set(v)].filter(id=>products.some(p=>p.id===id))),address:addressSchema.nullable(),addresses:z.array(savedAddressSchema).max(20).optional(),selectedAddressId:z.string().max(80).nullable().optional()}).strict().refine(p=>!p.addresses||new Set(p.addresses.map(a=>a.id)).size===p.addresses.length,'ID alamat harus unik').transform(p=>{
 const addresses=p.addresses??(p.address?[{id:'legacy',address:p.address}]:[]);
 const selectedAddressId:string|null=addresses.some(a=>a.id===p.selectedAddressId)?p.selectedAddressId!:(addresses.length?addresses[0].id:null);
 return {favorites:p.favorites,addresses,selectedAddressId,address:addresses.find(a=>a.id===selectedAddressId)?.address??null};
});
export type Address=z.infer<typeof addressSchema>;
export type Profile=z.infer<typeof profileSchema>;
export type User={id:string;name:string;email:string;picture?:string};
export const emptyProfile:Profile={favorites:[],address:null,addresses:[],selectedAddressId:null};
export const blankAddress:Address={label:'Rumah',recipient:'',phone:'',street:'',village:'',city:'',postalCode:'',notes:'',lat:null,lng:null};
