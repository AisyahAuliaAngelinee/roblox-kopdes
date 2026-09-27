'use client';
import {createContext,useContext,useState,useEffect,type Dispatch,type SetStateAction} from 'react';
type Cart=Record<string,number>;
type ContextValue={cart:Cart;setCart:Dispatch<SetStateAction<Cart>>;excluded:string[];setExcluded:Dispatch<SetStateAction<string[]>>;bankCode:string;setBankCode:Dispatch<SetStateAction<string>>;paymentMethod:'qris'|'gopay'|'bank';setPaymentMethod:Dispatch<SetStateAction<'qris'|'gopay'|'bank'>>;deliveryMethod:'express'|'regular';setDeliveryMethod:Dispatch<SetStateAction<'express'|'regular'>>};
const Context=createContext<ContextValue|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){const [cart,setCart]=useState<Cart>({}),[excluded,setExcluded]=useState<string[]>([]),[bankCode,setBankCode]=useState('BCA'),[paymentMethod,setPaymentMethod]=useState<'qris'|'gopay'|'bank'>('qris'),[deliveryMethod,setDeliveryMethod]=useState<'express'|'regular'>('regular');useEffect(()=>{setExcluded(list=>list.filter(id=>cart[id]>0));},[cart]);return <Context.Provider value={{cart,setCart,excluded,setExcluded,bankCode,setBankCode,paymentMethod,setPaymentMethod,deliveryMethod,setDeliveryMethod}}>{children}</Context.Provider>;}
export function useCart(){const value=useContext(Context);if(!value)throw Error('Cart provider missing');return value;}
