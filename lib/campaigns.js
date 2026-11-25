export function validateCampaignSchedule(p){
 if(p.campaignStatus&&!['planned','ongoing','completed'].includes(p.campaignStatus))return 'Choose a valid campaign status.';
 const start=p.startsAt?Date.parse(p.startsAt):NaN,end=p.endsAt?Date.parse(p.endsAt):NaN;
 if(p.campaignStatus==='planned'&&(!p.startsAt||!p.endsAt))return 'Scheduled campaigns need a start and end date.';
 if(p.campaignStatus==='ongoing'&&!p.endsAt)return 'Ongoing campaigns need an end date.';
 if((p.endsAt&&!Number.isFinite(end))||(p.startsAt&&(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)))return 'Enter valid dates with the end after the start.';
 return null;
}
export function campaignPhase(p,now=Date.now()){
 if(p.campaignStatus==='completed')return 'ended';
 if(!['planned','ongoing'].includes(p.campaignStatus)||validateCampaignSchedule(p))return 'unscheduled';
 if(now<Date.parse(p.startsAt))return 'upcoming';
 return now<Date.parse(p.endsAt)?'ongoing':'ended';
}
export function remainingTime(end,now){const seconds=Math.max(0,Math.floor((Date.parse(end)-now)/1000));return [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60]}
export function toDhakaInput(value){if(!value||!Number.isFinite(Date.parse(value)))return '';return new Date(Date.parse(value)+6*3600000).toISOString().slice(0,16)}
export function fromDhakaInput(value){return value?new Date(value+':00+06:00').toISOString():''}

// Backfill the announced deadline for winter records saved before scheduling existed.
// An explicit admin schedule (including No schedule) always takes precedence.
export function withCampaignDefaults(p){
 if(p.id!=='winter-relief'||p.campaignScheduleSet||p.campaignStatus)return p;
 return {...p,campaignStatus:'ongoing',endsAt:p.endsAt||'2026-12-15T17:59:59.000Z'};
}
