'use client';
import {createContext,useContext} from 'react';import type {Content,Language,UserSession} from '@/lib/types';
export type SiteContext={lang:Language;session:UserSession|null;recovery:boolean;refreshSession:()=>Promise<void>;t:(bn:string,en:string)=>string;data:Content;refresh:()=>Promise<void>;notice:(message:string)=>void};
export const Context=createContext<SiteContext|null>(null);
export function useSite(){const context=useContext(Context);if(!context)throw new Error('Missing Site context');return context}
