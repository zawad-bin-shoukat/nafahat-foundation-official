'use client';
import type {MediaFields} from '@/lib/types';
import {useSite} from './context';

export function ReportSource({item}:{item:MediaFields}){
 const {t,lang}=useSite();
 // Only the reviewed local source document is offered as a report download.
 if(item.reportUrl!=='/reports/nafahat-annual-report-2025.pdf')return null;
 const pages=(item.reportPages||[]).filter(page=>Number.isInteger(page)&&page>=1&&page<=15);
 const pageLabel=pages.map(page=>page.toLocaleString(lang==='bn'?'bn-BD':'en-BD')).join(', ');
 return <p className="notice small-text report-source"><a className="text-link" href={`${item.reportUrl}${pages.length?'#page='+pages[0]:''}`} target="_blank" rel="noopener noreferrer">{t('মূল বার্ষিক প্রতিবেদন পড়ুন (PDF)','Read the original annual report (PDF)')} ↗</a>{pages.length>0&&<span> · {t('পৃষ্ঠা ','Pages ')}{pageLabel}</span>}</p>;
}
