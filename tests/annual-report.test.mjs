import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {annualProjects,annualEvents,annualReports,annualPosts,annualImagePaths} from '../lib/annual-report-2025.js';
import {seed} from '../lib/initial-content.js';
import {campaignPhase,validateCampaignSchedule} from '../lib/campaigns.js';
import {validateProjectDetails,validateCompletionReport} from '../lib/project-details.js';
import {handleAPI} from '../server/api.js';

test('annual archive contains all documented activities and never activates historical fundraising',()=>{
 assert.equal(annualProjects.length,7);assert.equal(annualEvents.length,5);assert.equal(annualPosts.length,2);
 assert.deepEqual(seed.projects.filter(p=>campaignPhase(p,Date.parse('2026-11-25T06:00:00Z'))==='ongoing').map(p=>p.id),['winter-relief']);
 for(const p of annualProjects){assert.equal(p.accepting,false);assert.equal(campaignPhase(p),'ended');assert.equal(validateCampaignSchedule(p),null);assert.equal(validateProjectDetails(p),null);assert.notEqual(p.id,'winter-relief');}
 for(const collection of [seed.projects,seed.events,seed.posts,seed.reports])assert.equal(new Set(collection.map(p=>p.id)).size,collection.length);
 for(const src of annualImagePaths)assert.ok(existsSync('public'+src),src);
 assert.equal(annualImagePaths.size,23);assert.ok(existsSync('public/reports/nafahat-annual-report-2025.pdf'));
});

test('historical financial reports preserve source balances without inventing unknown income',()=>{
 const expected={'meat-for-all-2025':[40200,40200,0],'tree-plantation-2025':[8250,6500,1750],'winter-relief-2025':[25950,25800,150]};
 for(const r of annualReports){assert.equal(validateCompletionReport(r),null);if(!r.completion)continue;const c=r.completion,spent=c.expenses.reduce((sum,e)=>sum+e.amount,0);assert.equal(c.websiteTotal,0);assert.deepEqual([c.offlineTotal,spent,c.offlineTotal-spent],expected[r.projectId]);}
 for(const id of ['daily-labourers-meal-2025','ramadan-food-gifts-2025'])assert.equal(annualReports.find(r=>r.projectId===id).completion,undefined);
 assert.match(annualProjects.find(p=>p.id==='ramadan-food-gifts-2025').bodyEn,/64,230/);
 assert.equal(annualProjects.find(p=>p.id==='ramadan-food-gifts-2025').endsAt,undefined);
 assert.match(annualProjects.find(p=>p.id==='quran-campaign-2026').bodyEn,/Final participation numbers, results and gift distribution are not documented/);
});

test('database-edited winter is preserved and staff can resave bundled archive photos and source pages',async()=>{
 const db=new DatabaseSync(':memory:');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+file,'utf8'));
 const env={LOCAL_AUTH_TEST:true,ADMIN_EMAILS:'admin@example.org',DB:{prepare(sql){return {values:[],bind(...v){this.values=v;return this},async all(){return {results:db.prepare(sql).all(...this.values)}},async first(){return db.prepare(sql).get(...this.values)||null},async run(){return db.prepare(sql).run(...this.values)}}},async batch(items){db.exec('BEGIN');try{const results=[];for(const item of items)results.push(await item.run());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}}}};
 const req=(path,method='GET',body)=>new Request('https://foundation.test/api/'+path,{method,headers:{origin:'https://foundation.test','content-type':'application/json','oai-authenticated-user-id':'admin','oai-authenticated-user-email':'admin@example.org'},...(body?{body:JSON.stringify(body)}:{})});
 try{
  const winter={...seed.projects.find(p=>p.id==='winter-relief'),titleEn:'Owner-edited Winter 2026',imageUrl:'https://photos.example.org/my-cover.webp',imageUrls:['https://photos.example.org/gallery.webp'],campaignScheduleSet:true,campaignStatus:'ongoing',endsAt:'2026-12-15T17:59:00.000Z'};
  db.prepare('INSERT INTO content VALUES(?,?,?,?)').run(winter.id,'project',JSON.stringify(winter),new Date().toISOString());
  const content=await (await handleAPI(req('content'),env)).json();assert.deepEqual(content.projects.find(p=>p.id==='winter-relief'),{...winter,verifiedTotal:0});
  const archive=annualProjects[0];const save=await handleAPI(req('admin/content','POST',{kind:'project',id:archive.id,payload:archive,action:'publish',version:null}),env);assert.equal(save.status,200,await save.text());
  const after=await (await handleAPI(req('content'),env)).json();assert.equal(after.projects.find(p=>p.id===archive.id).imageUrl,archive.imageUrl);assert.deepEqual(after.projects.find(p=>p.id===archive.id).reportPages,[2]);
  for(const bad of ['/media/annual-report-2025/../../private.jpeg','//attacker.example/photo.jpeg','/unreviewed.jpeg']){const rejected=await handleAPI(req('admin/content','POST',{kind:'project',id:'unsafe-photo',payload:{...archive,id:'unsafe-photo',imageUrl:bad},action:'publish',version:null}),env);assert.equal(rejected.status,400);}
  const historicalDonation=await handleAPI(req('donations','POST',{projectId:archive.id,amount:'100',method:'bKash',transactionId:'ARCHIVE123',sender:'01712345678',paidAt:new Date().toISOString(),consent:'on'}),env);assert.equal(historicalDonation.status,400);
 }finally{db.close()}
});
