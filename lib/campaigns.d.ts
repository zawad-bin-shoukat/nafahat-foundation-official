type Schedule={campaignStatus?:string;startsAt?:string;endsAt?:string};
export function validateCampaignSchedule(p:Schedule):string|null;
export function campaignPhase(p:Schedule,now?:number):'ended'|'unscheduled'|'upcoming'|'ongoing';
export function remainingTime(end:string,now:number):number[];
export function toDhakaInput(value?:string):string;
export function fromDhakaInput(value:string):string;

export function withCampaignDefaults<T extends Schedule & {id:string;campaignScheduleSet?:boolean}>(p:T):T & Schedule;
