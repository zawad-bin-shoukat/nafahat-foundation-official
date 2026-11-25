export const financialFields=['fundraisingTarget','offlineTotal','offlineNoteBn','offlineNoteEn','offlineSeparate'];
export function validAmount(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100000000&&Math.abs(value*100-Math.round(value*100))<0.00001}
export function validateProjectDetails(p,{partial=false}={}){
 for(const key of ['objectivesBn','objectivesEn','beneficiariesBn','beneficiariesEn','areasBn','areasEn','itemsBn','itemsEn','offlineNoteBn','offlineNoteEn'])if(p[key]!==undefined&&(typeof p[key]!=='string'||p[key].length>4000))return 'Project facts must be text under 4,000 characters.';
 for(const key of ['fundraisingTarget','offlineTotal'])if(p[key]!==undefined&&!validAmount(p[key]))return 'Enter a valid non-negative amount with at most two decimal places (maximum BDT 100,000,000).';
 if(!partial&&p.offlineTotal>0&&(p.offlineSeparate!==true||!p.offlineNoteBn?.trim()||!p.offlineNoteEn?.trim()))return 'Confirm offline collections exclude website donations and provide a source note in both languages.';
 if(p.faqs!==undefined){if(!Array.isArray(p.faqs)||p.faqs.length>12)return 'Add at most 12 frequently asked questions.';for(const faq of p.faqs)if(!faq||['questionBn','questionEn','answerBn','answerEn'].some(key=>typeof faq[key]!=='string'||(!partial&&!faq[key].trim())||faq[key].length>(key.startsWith('question')?300:3000)))return 'Complete every FAQ question and answer in both languages.'}
 return null;
}
export function validateCompletionReport(p,{partial=false}={}){
 if(!p.completion)return null;
 const c=p.completion;
 if((!partial&&!p.projectId)||!c||typeof c!=='object'||Array.isArray(c)||(!partial||c.date)&&(!/^\d{4}-\d{2}-\d{2}$/.test(c.date||'')||!Number.isFinite(Date.parse(c.date))||new Date(c.date).toISOString().slice(0,10)!==c.date))return 'Select a project and a valid report date.';
 if(!Array.isArray(c.expenses)||c.expenses.length>30)return 'Add at most 30 expense categories.';
 for(const expense of c.expenses)if(!expense||!validAmount(expense.amount)||['labelBn','labelEn'].some(k=>typeof expense[k]!=='string'||(!partial&&!expense[k].trim())||expense[k].length>200))return 'Each expense needs a label in both languages and a valid amount.';
 for(const key of ['outcomesBn','outcomesEn'])if(typeof c[key]!=='string'||(!partial&&!c[key].trim())||c[key].length>4000)return 'Describe the distribution results in both languages.';
 if(c.expenses.reduce((sum,e)=>sum+Math.round(e.amount*100),0)>10000000000)return 'The expense total is too large.';
 return null;
}
export function fundingSummary(p){const website=Math.round(Number(p.verifiedTotal||0)*100),offline=Math.round(Number(p.offlineTotal||0)*100),target=Math.round(Number(p.fundraisingTarget||0)*100),total=website+offline;return {website:website/100,offline:offline/100,total:total/100,target:target/100,remaining:Math.max(0,target-total)/100,percent:target>0?Math.min(100,Math.round(total/target*100)):0}}
