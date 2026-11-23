export function validateCampaignSchedule(p){
 if(p.campaignStatus&&!['planned','ongoing','completed'].includes(p.campaignStatus))return 'Choose a valid campaign status.';
 const start=p.startsAt?Date.parse(p.startsAt):NaN,end=p.endsAt?Date.parse(p.endsAt):NaN;
 if(p.campaignStatus&&p.campaignStatus!=='completed'&&(!p.startsAt||!p.endsAt))return 'Scheduled and ongoing campaigns need a start and end date.';
 if((p.startsAt||p.endsAt)&&(!Number.isFinite(start)||!Number.isFinite(end)||end<=start))return 'Campaign end must be after its start. Enter both dates.';
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
