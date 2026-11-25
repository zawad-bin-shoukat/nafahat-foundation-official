import {campaignPhase} from './campaigns.js';

export const projectCategories=['humanitarian','dawah','environment','community'];
const legacyCategories={'daily-labourers-meal-2025':'humanitarian','ramadan-food-gifts-2025':'humanitarian','meat-for-all-2025':'humanitarian','tree-plantation-2025':'environment'};
export function projectCategory(project){
 if(projectCategories.includes(project.activityCategory))return project.activityCategory;
 return legacyCategories[project.id]||(project.kind==='winter'?'humanitarian':project.kind==='learning'?'dawah':'community');
}
export function projectStatus(project,now){
 const phase=campaignPhase(project,now);
 return phase==='ended'?'past':phase==='upcoming'?'upcoming':phase==='ongoing'?'ongoing':'regular';
}
function validPublication(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value))return '';
 const day=value.length===7?value+'-01':value;
 return Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day?value:'';
}
export function projectDate(project){
 const published=validPublication(project.publishedAt);if(published)return published;
 for(const value of [project.startsAt,project.endsAt])if(value&&Number.isFinite(Date.parse(value))){const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));return date;}
 return '';
}
export function projectYears(projects){return [...new Set(projects.map(project=>projectDate(project).slice(0,4)).filter(Boolean))].sort().reverse()}
export function filterProjects(projects,{year='all',category='all',status='all',search=''}={},now=Date.now()){
 const query=search.trim().normalize('NFKC').toLocaleLowerCase();
 return projects.filter(project=>{
  const date=projectDate(project);
  if(year==='undated'?!!date:year!=='all'&&!date.startsWith(year+'-'))return false;
  if(category!=='all'&&projectCategory(project)!==category)return false;
  if(status!=='all'&&projectStatus(project,now)!==status)return false;
  return !query||[project.titleBn,project.titleEn,project.summaryBn,project.summaryEn,project.areasBn,project.areasEn].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase().includes(query);
 });
}

// Source-specific results, not a deduplicated lifetime beneficiary count.
const report='/reports/nafahat-annual-report-2025.pdf';
const impact=[
 {projectId:'ramadan-food-gifts-2025',value:54,labelBn:'পরিবারকে খাদ্য উপহার',labelEn:'Families received food gifts',contextBn:'রমাদান ১৪৪৬ · ২০২৫',contextEn:'Ramadan 1446 · 2025',page:3,icon:'community'},
 {projectId:'winter-relief-2025',value:120,labelBn:'কম্বল বিতরণ',labelEn:'Blankets distributed',contextBn:'শীতবস্ত্র কার্যক্রম · ২০২৫',contextEn:'Winter relief · 2025',page:14,icon:'winter'},
 {projectId:'tree-plantation-2025',value:22,labelBn:'চারা রোপণ',labelEn:'Saplings planted',contextBn:'মাদরাসা প্রাঙ্গণে · ২০২৫',contextEn:'Madrasa garden · 2025',page:8,icon:'environment'},
 {projectId:'fajr-campaign-2025',value:41,labelBn:'ফজর ক্যাম্পেইনে অংশগ্রহণকারী',labelEn:'Fajr campaign participants',contextBn:'৪০ দিনের উদ্যোগ · ২০২৫',contextEn:'40-day initiative · 2025',page:10,icon:'learning'}
];
export function documentedImpact(content){return impact.filter(item=>content.projects.some(project=>project.id===item.projectId&&project.reportUrl===report)).map(item=>({...item,reportUrl:report}))}

export function journeyEntries(content,now=Date.now()){
 const projects=content.projects.filter(project=>projectStatus(project,now)==='past').map(project=>({...project,entryKind:'project',journeyDate:projectDate(project)}));
 const events=content.events.filter(event=>event.status==='past').map(event=>({...event,entryKind:'event',summaryBn:event.bodyBn,summaryEn:event.bodyEn,journeyDate:validPublication(event.publishedAt)}));
 return [...projects,...events].filter(item=>item.journeyDate&&Date.parse(item.journeyDate.length===7?item.journeyDate+'-01':item.journeyDate)<=now).sort((a,b)=>a.journeyDate.localeCompare(b.journeyDate)||a.id.localeCompare(b.id));
}
export function journeyPreview(entries){const milestones=['daily-labourers-meal-2025','ramadan-food-gifts-2025','tree-plantation-2025','fajr-campaign-2025','winter-relief-2025','quran-campaign-2026'];return entries.filter(entry=>milestones.includes(entry.id))}
