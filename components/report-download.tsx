'use client';
import type {Entry} from '@/lib/types';
import {buildReportHTML} from '@/lib/reporting';
import {useSite} from './context';
export function ReportDownload({report}:{report:Entry}){
 const {data,t,lang}=useSite();
 function download(){
  const html=buildReportHTML(report,data.projects.find(p=>p.id===report.projectId),lang);
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),link=document.createElement('a');
  link.href=url;link.download=`nafahat-${report.id.replace(/[^a-z0-9-]/gi,'-')}-${lang}.html`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <button type="button" className="button outline small" onClick={download}>{t('প্রতিবেদন ডাউনলোড','Download report')} ↓</button>;
}
