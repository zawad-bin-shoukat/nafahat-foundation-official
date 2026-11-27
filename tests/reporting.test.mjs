import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../lib/initial-content.js';
import {availableReportYears,reportYears,filterReports,completionTotals,websiteDonationTotal,websiteRecordsReady,buildReportHTML} from '../lib/reporting.js';

test('reports filter together by period, project, type and bilingual search without changing snapshots',()=>{
 const before=structuredClone(seed.reports);
 assert.deepEqual(availableReportYears(seed.reports),['2026','2025']);
 assert.deepEqual(filterReports(seed.reports,seed.projects,{year:'2025',project:'winter-relief-2025',type:'financial',search:'শীত'}).map(r=>r.projectId),['winter-relief-2025']);
 assert.equal(filterReports(seed.reports,seed.projects,{year:'2026',type:'financial'}).length,0);
 assert.deepEqual(filterReports(seed.reports,seed.projects,{year:'2026'}).map(r=>r.id),['annual-report-2025']);
 assert.equal(filterReports(seed.reports,seed.projects,{type:'activity'}).length,2);
 assert.equal(filterReports(seed.reports,seed.projects,{search:'does-not-exist'}).length,0);
 assert.deepEqual(reportYears({publishedAt:'2025-02-31'}),[]);
 assert.deepEqual(reportYears({publishedAt:'2025-03'}),['2025']);
 assert.equal(filterReports([{id:'undated'}],[],{year:'undated'}).length,1);
 assert.deepEqual(seed.reports,before);
});

test('financial summaries use integer minor units and distinguish unreported receipts from zero',()=>{
 assert.deepEqual(completionTotals({websiteTotal:0.1,offlineTotal:0.2,expenses:[{amount:0.1},{amount:0.2}]}),{website:0.1,offline:0.2,received:0.3,expenses:0.3,balance:0});
 assert.deepEqual(completionTotals({expenses:[{amount:5000}]}),{website:null,offline:null,received:null,expenses:5000,balance:null});
 assert.equal(completionTotals({websiteTotal:0,offlineTotal:10,expenses:[{amount:15}]}).balance,-5);
 const winter=seed.reports.find(r=>r.projectId==='winter-relief-2025');assert.equal(completionTotals(winter.completion).balance,150);
 const copy=structuredClone(winter);websiteDonationTotal([{verifiedTotal:100000,offlineTotal:200000}]);assert.deepEqual(winter,copy);
});

test('live website total excludes offline historical collections and report snapshots',()=>{
 assert.equal(websiteDonationTotal([{verifiedTotal:100.1,offlineTotal:10000},{verifiedTotal:0.2,offlineTotal:5000}]),100.3);
 assert.equal(websiteDonationTotal([{offlineTotal:74400},{verifiedTotal:-10},{verifiedTotal:NaN}]),0);
 assert.equal(websiteRecordsReady(seed.projects),false);assert.equal(websiteRecordsReady([]),false);assert.equal(websiteRecordsReady([{verifiedTotal:0}]),true);assert.equal(websiteRecordsReady([{verifiedTotal:0},{verifiedTotal:undefined}]),false);
});

test('downloads escape supplied text, omit private fields and include source links and print support',()=>{
 const report={id:'example',titleEn:'<script>alert(1)</script>',titleBn:'প্রতিবেদন',bodyEn:'<img src=x onerror=alert(1)>',bodyBn:'বিবরণ',date:'2025-03',privateDonor:'PRIVATE DONOR',internalNote:'PRIVATE NOTE',reportUrl:'/reports/nafahat-annual-report-2025.pdf',reportPages:[3]};
 const html=buildReportHTML(report,undefined,'en');
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img src=x'));
 assert.ok(!html.includes('PRIVATE DONOR'));assert.ok(!html.includes('PRIVATE NOTE'));
 assert.ok(html.includes('window.print()'));assert.ok(html.includes('Annual Report 2025 (PDF)'));assert.ok(html.includes('Unreported amounts are not treated as zero'));assert.ok(!html.includes('৳0'));
 assert.ok(!buildReportHTML({...report,reportUrl:'javascript:alert(1)'}).includes('href="javascript:'));
 assert.ok(buildReportHTML(report,undefined,'bn').includes('প্রিন্ট / PDF সংরক্ষণ'));
 const financial=seed.reports.find(r=>r.projectId==='winter-relief-2025');const exported=buildReportHTML(financial,seed.projects.find(p=>p.id===financial.projectId),'en');
 assert.ok(exported.includes('25,950'));assert.ok(exported.includes('25,800'));assert.ok(exported.includes('৳150'));assert.ok(exported.includes('publication snapshot'));
});
