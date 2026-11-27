const sourcePDF='/reports/nafahat-annual-report-2025.pdf';
function dateYear(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value))return '';
 const day=value.length===7?value+'-01':value;
 return Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day?day.slice(0,4):'';
}
export function reportYears(report){
 if(report.id==='annual-report-2025'&&report.reportUrl===sourcePDF)return ['2025','2026'];
 const year=dateYear(report.completion?.date)||dateYear(report.publishedAt)||dateYear(report.date);return year?[year]:[];
}
export function reportType(report){return report.completion?'financial':!report.projectId&&report.reportUrl===sourcePDF?'annual':'activity'}
export function availableReportYears(reports){return [...new Set(reports.flatMap(reportYears))].sort().reverse()}
export function filterReports(reports,projects,{year='all',project='all',type='all',search=''}={}){
 const query=search.trim().normalize('NFKC').toLocaleLowerCase();
 return reports.filter(report=>{
  const years=reportYears(report);
  if(year==='undated'?years.length:year!=='all'&&!years.includes(year))return false;
  if(project!=='all'&&report.projectId!==project)return false;
  if(type!=='all'&&reportType(report)!==type)return false;
  const linked=projects.find(p=>p.id===report.projectId);
  return !query||[report.titleBn,report.titleEn,report.bodyBn,report.bodyEn,linked?.titleBn,linked?.titleEn].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase().includes(query);
 }).sort((a,b)=>{
  if(reportType(a)==='annual'&&reportType(b)!=='annual')return -1;if(reportType(b)==='annual'&&reportType(a)!=='annual')return 1;
  return (b.completion?.date||b.publishedAt||'').localeCompare(a.completion?.date||a.publishedAt||'')||a.id.localeCompare(b.id);
 });
}
const minor=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?Math.round(value*100):null;
export function completionTotals(completion){
 const website=minor(completion.websiteTotal),offline=minor(completion.offlineTotal);
 const received=website!==null&&offline!==null?website+offline:null;
 const expenses=Array.isArray(completion.expenses)&&completion.expenses.every(e=>minor(e.amount)!==null)?completion.expenses.reduce((sum,e)=>sum+minor(e.amount),0):null;
 return {website:website===null?null:website/100,offline:offline===null?null:offline/100,received:received===null?null:received/100,expenses:expenses===null?null:expenses/100,balance:received===null||expenses===null?null:(received-expenses)/100};
}
export function websiteRecordsReady(projects){return projects.length>0&&projects.every(project=>minor(project.verifiedTotal)!==null)}
export function websiteDonationTotal(projects){return projects.reduce((sum,project)=>sum+(minor(project.verifiedTotal)||0),0)/100}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function buildReportHTML(report,project,lang='en'){
 const t=(bn,en)=>lang==='bn'?bn:en;
 const money=value=>value===null?t('উল্লেখ নেই','Not reported'):'৳'+value.toLocaleString(lang==='bn'?'bn-BD':'en-BD',{maximumFractionDigits:2});
 const c=report.completion,totals=c?completionTotals(c):null;
 const row=(label,value)=>`<tr><th>${escape(label)}</th><td>${escape(money(value))}</td></tr>`;
 const date=c?.date||report.date||report.publishedAt||reportYears(report).join('–');
 const financial=c?`<h2>${escape(t('প্রকাশিত হিসাব','Published accounts'))}</h2><table><caption>${escape(t('আয়ের উৎস ও ব্যয়ের বিবরণ','Receipt sources and expenses'))}</caption><tbody>${row(t('ওয়েবসাইটে যাচাইকৃত — প্রকাশের সময়','Website-verified at publication'),totals.website)}${row(t('ওয়েবসাইটের বাইরের সংগ্রহ','Collections outside this website'),totals.offline)}${row(t('মোট প্রাপ্তি','Total receipts'),totals.received)}${c.expenses.map(e=>row(t(e.labelBn,e.labelEn),e.amount)).join('')}${row(t('মোট ব্যয়','Total expenses'),totals.expenses)}${row(totals.balance!==null&&totals.balance<0?t('ঘাটতি','Deficit'):t('অবশিষ্ট','Balance'),totals.balance===null?null:Math.abs(totals.balance))}</tbody></table><p>${escape(t(c.offlineNoteBn,c.offlineNoteEn))}</p><h2>${escape(t('কার্যক্রমের ফলাফল','Activity results'))}</h2><p>${escape(t(c.outcomesBn,c.outcomesEn))}</p><p class="note">${escape(t('প্রকাশের সময় সংরক্ষিত হিসাব; পরবর্তী অনুদান এই অঙ্ক পরিবর্তন করে না।','This account is a publication snapshot; later donations do not change these figures.'))}</p>`:`<p class="note">${escape(t('এই প্রতিবেদনে পূর্ণ আয়ের-ব্যয়ের হিসাব নেই। অনুল্লিখিত অঙ্ককে শূন্য ধরা হয়নি।','This report does not provide a complete financial account. Unreported amounts are not treated as zero.'))}</p>`;
 const source=report.reportUrl===sourcePDF?`<p>${escape(t('মূল সূত্র','Original source'))}: <a href="https://nafahat-foundation-official.vercel.app${sourcePDF}" target="_blank" rel="noopener noreferrer">${escape(t('বার্ষিক প্রতিবেদন ২০২৫ (PDF)','Annual Report 2025 (PDF)'))}</a>${report.reportPages?.length?' · '+escape(t('পৃষ্ঠা ','Pages ')+report.reportPages.join(', ')):''}</p>`:'';
 return `<!doctype html><html lang="${lang==='bn'?'bn':'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(t(report.titleBn,report.titleEn))}</title><style>body{font:16px/1.8 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#183d2d}h1{font-size:28px}h2{font-size:21px}p{white-space:pre-line;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd5cb;padding:12px;text-align:left}caption{text-align:left;margin-bottom:10px}.note{background:#f3f6ef;padding:16px}button{padding:12px;cursor:pointer}@media print{button{display:none}body{margin:0;max-width:none}tr{break-inside:avoid}}</style></head><body><button onclick="window.print()">${escape(t('প্রিন্ট / PDF সংরক্ষণ','Print / Save as PDF'))}</button><h1>Nafahat Foundation</h1><h2>${escape(t(report.titleBn,report.titleEn))}</h2><p>${escape(project?t(project.titleBn,project.titleEn):t('ফাউন্ডেশনের প্রতিবেদন','Foundation report'))}${date?' · '+escape(date):''}</p><p>${escape(t(report.bodyBn,report.bodyEn))}</p>${financial}${source}</body></html>`;
}
