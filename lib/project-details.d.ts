import type {Project,Entry} from './types';
export const financialFields:string[];
export function validAmount(value:unknown):boolean;
export function validateProjectDetails(p:Project,options?:{partial?:boolean}):string|null;
export function validateCompletionReport(p:Entry,options?:{partial?:boolean}):string|null;
export function fundingSummary(p:Project):{website:number;offline:number;total:number;target:number;remaining:number;percent:number};
