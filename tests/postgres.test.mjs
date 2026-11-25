import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {databaseAdapter,postgresQuery} from '../server/postgres.js';
import {handleAPI,seed} from '../server/api.js';
import {columns,validateSnapshot,importSnapshot,databaseSummary} from '../server/migration.js';
const ddl=readFileSync('supabase/migrations/001_foundation.sql','utf8');
function executor(pg){return {async query(text,params=[]){const result=await pg.query(text,params);const rows=result.rows;rows.count=result.affectedRows??rows.length;return rows},transaction:callback=>pg.transaction(tx=>callback(executor(tx)))}}
async function fixture(){const pg=new PGlite();await pg.exec(ddl);const ex=executor(pg);return {pg,ex,env:{DB:databaseAdapter(ex),LOCAL_AUTH_TEST:true,ADMIN_EMAILS:'admin@example.org'}}}
function request(path,method='GET',payload,user){return new Request('https://nafahat.test/api/'+path,{method,headers:{origin:'https://nafahat.test','content-type':'application/json',...(user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.org'}:{})},...(payload?{body:JSON.stringify(payload)}:{})})}
const donation=()=>({projectId:'winter-relief',amount:'250.50',method:'bKash',transactionId:'POSTGRES123',sender:'01712345678',paidAt:new Date(Date.now()-60000).toISOString(),consent:'on'});
test('PostgreSQL runs donation review, duplicate handling, ownership and staff permissions',async()=>{const {pg,ex,env}=await fixture();try{const submitted=await handleAPI(request('donations','POST',donation(),'alice'),env);assert.equal(submitted.status,201);const {token}=await submitted.json();assert.equal((await handleAPI(request('donations','POST',donation(),'bob'),env)).status,409);const d=(await ex.query('SELECT id FROM foundation.donations'))[0];assert.equal((await handleAPI(request('admin/donations/'+d.id,'PATCH',{status:'verified',matched:'on'},'admin'),env)).status,200);const content=await (await handleAPI(request('content'),env)).json();assert.equal(content.projects.find(p=>p.id==='winter-relief').verifiedTotal,250.5);assert.equal((await (await handleAPI(request('track/'+token),env)).json()).status,'verified');assert.equal((await (await handleAPI(request('account','GET',undefined,'alice'),env)).json()).donations.length,1);assert.equal((await (await handleAPI(request('account','GET',undefined,'bob'),env)).json()).donations.length,0);await handleAPI(request('account','POST',{},'editor'),env);assert.equal((await handleAPI(request('admin/users','PATCH',{userId:'editor',role:'editor'},'admin'),env)).status,200);assert.equal((await handleAPI(request('admin/donations/'+d.id,'PATCH',{status:'rejected'},'editor'),env)).status,403);const entry={titleBn:'পরীক্ষার আয়োজন',titleEn:'Postgres event',bodyBn:'সম্পূর্ণ বিবরণ',bodyEn:'Complete description',status:'past',projectId:'winter-relief'};assert.equal((await handleAPI(request('admin/content','POST',{kind:'event',id:'postgres-event',payload:entry},'editor'),env)).status,200);const waiting=(await (await handleAPI(request('admin/content','GET',undefined,'admin'),env)).json()).drafts.find(d=>d.id==='postgres-event');assert.ok(!(await (await handleAPI(request('content'),env)).json()).events.some(e=>e.id==='postgres-event'));assert.equal((await handleAPI(request('admin/content','POST',{action:'publish',version:waiting.version,kind:'event',id:'postgres-event',payload:waiting.payload},'admin'),env)).status,200);const refreshed=await (await handleAPI(request('content'),env)).json();assert.equal(refreshed.events.find(e=>e.id==='postgres-event').bodyBn,entry.bodyBn);assert.equal((await ex.query('SELECT COUNT(*) AS n FROM foundation.audit'))[0].n,4)}finally{await pg.close()}});
function fullRow(table,values){const row=Object.fromEntries(columns[table].map(key=>[key,['owner_user_id','reviewed_at','reviewed_by'].includes(key)?null:'']));return {...row,...values}}
function snapshot(){const tables=Object.fromEntries(Object.keys(columns).map(table=>[table,[]]));tables.profiles=[fullRow('profiles',{user_id:'sb:existing-user',email:'member@example.org',name:'নাম',created_at:'2026-11-22',updated_at:'2026-11-22'})];tables.user_roles=[fullRow('user_roles',{user_id:'sb:existing-user',role:'editor',updated_by:'admin',updated_at:'2026-11-22'})];tables.content=[fullRow('content',{id:'winter-relief',kind:'project',payload:JSON.stringify({...seed.projects[0],bodyBn:'অক্ষত তথ্য '.repeat(1000)}),updated_at:'2026-11-22'})];tables.audit=[fullRow('audit',{id:'audit-old',actor:'admin',action:'content.save',target:'winter-relief',details:JSON.stringify({kind:'project',payload:JSON.parse(tables.content[0].payload)}),created_at:'2026-11-22'})];tables.donations=[fullRow('donations',{id:'old-donation',project_id:'winter-relief',amount_minor:724000,method:'bKash',receiver:'01771525664',transaction_id:'OLD12345',sender:'01700000000',paid_at:'2026-11-20',status:'verified',token_hash:'previous-hash',created_at:'2026-11-20',owner_user_id:'sb:existing-user'})];return {format:'nafahat-d1-v1',complete:true,sourceCounts:Object.fromEntries(Object.entries(tables).map(([table,rows])=>[table,rows.length])),tables}}
test('migration preserves long Unicode content, ownership, financial totals and rejects incomplete exports',async()=>{const {pg,ex}=await fixture();try{const data=snapshot();assert.throws(()=>validateSnapshot({...data,complete:false}),/complete/);assert.throws(()=>validateSnapshot({...data,sourceCounts:{...data.sourceCounts,content:2}}),/count mismatch/);const partial=structuredClone(data);delete partial.tables.profiles[0].email;assert.throws(()=>validateSnapshot(partial),/columns/);assert.equal((await importSnapshot(ex,data)).dryRun,true);assert.equal((await databaseSummary(ex)).counts.content,0);const imported=await importSnapshot(ex,data,{apply:true});assert.equal(imported.verifiedTotalMinor,724000);assert.equal((await ex.query('SELECT payload FROM foundation.content'))[0].payload,data.tables.content[0].payload);assert.equal((await ex.query('SELECT details FROM foundation.audit'))[0].details,data.tables.audit[0].details);assert.equal((await ex.query('SELECT owner_user_id FROM foundation.donations'))[0].owner_user_id,'sb:existing-user');assert.equal((await importSnapshot(ex,data,{apply:true})).alreadyImported,true);const changed=snapshot();changed.tables.profiles[0].name='Changed';await assert.rejects(importSnapshot(ex,changed,{apply:true}),/target contains/)}finally{await pg.close()}});
test('failed PostgreSQL import rolls back every inserted row',async()=>{const {pg,ex}=await fixture();try{const data=snapshot();data.tables.user_roles[0].user_id='missing-profile';await assert.rejects(importSnapshot(ex,data,{apply:true}));const summary=await databaseSummary(ex);assert.ok(Object.values(summary.counts).every(n=>n===0));assert.equal((await ex.query('SELECT COUNT(*) AS n FROM foundation.migration_runs'))[0].n,0)}finally{await pg.close()}});
test('SQL binding preserves literal question marks and qualified table names',()=>{assert.equal(postgresQuery("SELECT '?' AS mark FROM donations WHERE id=? AND name='can''t ?'"),"SELECT '?' AS mark FROM foundation.donations WHERE id=$1 AND name='can''t ?'")});

test('verified team signup remains unprivileged until an admin assigns Editor; revocation is immediate',async t=>{
 const {pg,ex,env}=await fixture();
 const production={...env,LOCAL_AUTH_TEST:false,SUPABASE_URL:'https://auth-test.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
 const staffId='33333333-3333-4333-8333-333333333333';
 let confirmed=false;
 t.mock.method(globalThis,'fetch',async(_url,options)=>{
  const admin=options.headers.Authorization==='Bearer administrator-token';
  return Response.json({id:admin?'44444444-4444-4444-8444-444444444444':staffId,email:admin?'admin@example.org':'editor@example.org',email_confirmed_at:admin||confirmed?'2026-11-22':null,user_metadata:{full_name:'Team Member',role:'admin'}});
 });
 const call=(path,method='GET',payload,admin=false)=>{const r=request(path,method,payload);r.headers.set('authorization','Bearer '+(admin?'administrator-token':'team-member-token'));return handleAPI(r,production)};
 try{
  assert.equal((await call('account','POST',{})).status,401);
  assert.equal((await ex.query('SELECT COUNT(*)::int AS n FROM foundation.profiles'))[0].n,0);
  confirmed=true;
  assert.equal((await call('account','POST',{})).status,200);
  assert.equal((await (await call('me')).json()).role,'user');
  assert.equal((await call('admin')).status,403);
  assert.equal((await call('admin/users','PATCH',{userId:'sb:'+staffId,role:'editor'})).status,403);
  const directory=await (await call('admin/users','GET',undefined,true)).json();
  assert.equal(directory.users.find(u=>u.user_id==='sb:'+staffId).role,'user');
  assert.equal((await call('admin/users','PATCH',{userId:'sb:'+staffId,role:'editor'},true)).status,200);
  const panel=await (await call('admin')).json();
  assert.equal(panel.permissions.content,true);assert.equal(panel.permissions.users,false);assert.equal(panel.permissions.donations,false);assert.deepEqual(panel.donations,[]);
  for(const kind of ['project','post','event']){
   const payload={titleBn:'টিমের প্রকাশনা',titleEn:'Team publication',bodyBn:'সম্পূর্ণ বিবরণ',bodyEn:'Complete description',accepting:false};
   assert.equal((await call('admin/content','POST',{kind,id:'team-'+kind,payload})).status,200);
  }
  let publicContent=await (await call('content')).json();
  assert.ok(!publicContent.projects.some(p=>p.id==='team-project'));
  const pending=(await (await call('admin/content')).json()).drafts;
  for(const draft of pending){assert.equal((await call('admin/content','POST',{action:'publish',kind:draft.kind,id:draft.id,payload:draft.payload,version:draft.version})).status,403);assert.equal((await call('admin/content','POST',{action:'publish',kind:draft.kind,id:draft.id,payload:draft.payload,version:draft.version},true)).status,200)}
  publicContent=await (await call('content')).json();
  assert.ok(publicContent.projects.some(p=>p.id==='team-project'));assert.ok(publicContent.posts.some(p=>p.id==='team-post'));assert.ok(publicContent.events.some(p=>p.id==='team-event'));
  assert.equal((await call('admin/users')).status,403);
  assert.equal((await call('admin/users','PATCH',{userId:'sb:'+staffId,role:'admin'})).status,403);
  assert.equal((await call('admin/users','PATCH',{userId:'sb:'+staffId,role:'user'},true)).status,200);
  assert.equal((await call('admin')).status,403);
  assert.equal((await call('admin/content','POST',{kind:'event',id:'revoked-editor-event',payload:{titleBn:'অনুমতি নেই',titleEn:'Not allowed'}})).status,403);
  assert.equal((await ex.query("SELECT COUNT(*)::int AS n FROM foundation.content WHERE id='revoked-editor-event'"))[0].n,0);
  assert.equal((await call('admin/users','PATCH',{userId:'sb:'+staffId,role:'user'},true)).status,200);
  assert.equal((await call('admin/content','POST',{kind:'post',id:'after-revoke',payload:{titleBn:'ক',titleEn:'X'}})).status,403);
 }finally{await pg.close()}
});

test('campaign galleries preserve 10 photos, validate dates, and restrict upload signing to content staff',async t=>{
 const {pg,ex,env}=await fixture();try{
  await handleAPI(request('account','POST',{},'editor'),env);
  await handleAPI(request('account','POST',{},'finance'),env);
  await handleAPI(request('admin/users','PATCH',{userId:'editor',role:'editor'},'admin'),env);
  await handleAPI(request('admin/users','PATCH',{userId:'finance',role:'finance'},'admin'),env);
  assert.equal((await handleAPI(request('admin/media/sign','POST',{},'finance'),env)).status,403);
  assert.equal((await handleAPI(request('admin/media/sign','POST',{}),env)).status,403);
  assert.equal((await handleAPI(request('admin/media/sign','POST',{},'editor'),env)).status,503);
  const gallery=Array.from({length:10},(_,i)=>`https://photos.example.org/photo-${i}.webp`);
  const p={titleBn:'ক্যাম্পেইন',titleEn:'Campaign',imageUrl:gallery[0],imageUrls:gallery,campaignStatus:'ongoing',startsAt:'2026-11-23T00:00:00Z',endsAt:'2026-11-30T00:00:00Z',accepting:false};
  assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:'gallery-campaign',payload:p},'editor'),env)).status,200);
  const firstDraft=(await (await handleAPI(request('admin/content','GET',undefined,'admin'),env)).json()).drafts.find(d=>d.id==='gallery-campaign');assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:'gallery-campaign',payload:firstDraft.payload,action:'publish',version:firstDraft.version},'admin'),env)).status,200);const saved=(await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id==='gallery-campaign');assert.deepEqual(saved.imageUrls,gallery.slice(1));assert.equal(saved.endsAt,p.endsAt);
  for(const patch of [{imageUrls:[...gallery,'javascript:alert(1)']},{imageUrls:Array(21).fill('https://photos.example.org/x.webp')},{endsAt:p.startsAt},{campaignStatus:'planned',startsAt:''}])assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:'bad-gallery',action:'submit',payload:{...p,...patch}},'editor'),env)).status,400);
  const updated={...p,imageUrl:gallery[1],imageUrls:gallery.slice(1)},latest=(await (await handleAPI(request('admin/content','GET',undefined,'admin'),env)).json()).drafts.find(d=>d.id==='gallery-campaign');
  assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:'gallery-campaign',payload:updated,version:latest.version},'editor'),env)).status,200);
  const row=(await ex.query("SELECT payload FROM foundation.content WHERE id='draft:gallery-campaign'"))[0];assert.deepEqual(JSON.parse(row.payload).payload.imageUrls,gallery.slice(2));assert.deepEqual((await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id==='gallery-campaign').imageUrls,gallery.slice(1));
  const secret='sb_secret_test_private';t.mock.method(globalThis,'fetch',async(url)=>String(url).includes('/bucket/')?Response.json({public:true}):Response.json({url:'/object/upload/sign/campaign-media/test.webp?token=temporary-token'}));
  const configured={...env,SUPABASE_URL:'https://media-test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:secret};
  const config=await (await handleAPI(request('admin/media/config','GET',undefined,'editor'),configured)).json();assert.equal(config.ready,true);assert.ok(!JSON.stringify(config).includes(secret));
  const signed=await handleAPI(request('admin/media/sign','POST',{contentId:'gallery-campaign',kind:'project',contentType:'image/webp',size:2048},'editor'),configured);assert.equal(signed.status,200);assert.equal((await signed.json()).token,'temporary-token');
 }finally{await pg.close()}
});

test('legacy saved winter content gets a working deadline and explicitly disabling it remains disabled',async()=>{
 const {pg,ex,env}=await fixture();try{
  const cover='https://photos.example.org/main.webp',gallery=Array.from({length:10},(_,i)=>`https://photos.example.org/gallery-${i}.webp`);
  const legacy={...seed.projects.find(p=>p.id==='winter-relief'),titleEn:'Team-edited winter relief',bodyEn:'Existing team description',imageUrl:cover,imageUrls:[cover,...gallery]};delete legacy.campaignStatus;delete legacy.endsAt;delete legacy.startsAt;
  await ex.query('INSERT INTO foundation.content (kind,id,payload,updated_at) VALUES ($1,$2,$3,$4)',['project','winter-relief',JSON.stringify(legacy),new Date().toISOString()]);
  const p=(await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id==='winter-relief');
  assert.equal(p.endsAt,'2026-12-15T17:59:59.000Z');assert.equal(p.campaignStatus,'ongoing');assert.equal(p.titleEn,legacy.titleEn);assert.equal(p.bodyEn,legacy.bodyEn);assert.equal(p.imageUrl,cover);assert.deepEqual(p.imageUrls,legacy.imageUrls);
  const disabled={...p,campaignStatus:'',startsAt:'',endsAt:''};assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:'winter-relief',payload:disabled},'admin'),env)).status,200);
  const saved=(await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id==='winter-relief');assert.equal(saved.campaignStatus,'');assert.equal(saved.endsAt,'');assert.equal(saved.campaignScheduleSet,true);assert.equal(saved.imageUrl,cover);assert.deepEqual(saved.imageUrls,gallery);
 }finally{await pg.close()}
});

test('draft approval isolates public content, detects stale revisions, records review notes and preserves the live version',async()=>{
 const {pg,env}=await fixture();try{
  await handleAPI(request('account','POST',{},'editor'),env);await handleAPI(request('admin/users','PATCH',{userId:'editor',role:'editor'},'admin'),env);
  const original=seed.projects.find(p=>p.id==='winter-relief'),payload={...original,titleEn:'Private winter draft',objectivesEn:'Reach families',objectivesBn:'পরিবারের পাশে থাকা',faqs:[{questionBn:'কীভাবে?',questionEn:'How?',answerBn:'নির্দেশনা দেখুন',answerEn:'Follow the instructions'}]};
  const call=(action,p=payload,version=null,user='editor',note)=>handleAPI(request('admin/content','POST',{kind:'project',id:original.id,payload:p,action,version,note},user),env);
  const initial=await call('draft');assert.equal(initial.status,200);const d1=(await initial.json()).draft;
  assert.equal((await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id===original.id).titleEn,original.titleEn);
  assert.equal((await handleAPI(request('admin/content'),env)).status,403);assert.equal((await handleAPI(request('admin/content/history?id=winter-relief'),env)).status,403);
  assert.equal((await call('publish',payload,d1.version)).status,403);
  const review=await call('submit',payload,d1.version);assert.equal(review.status,200);const d2=(await review.json()).draft;assert.equal(d2.stage,'review');
  assert.equal((await call('publish',payload,d1.version,'admin')).status,409);
  const returned=await call('request-changes',payload,d2.version,'admin','Please confirm the distribution area.');assert.equal(returned.status,200);const d3=(await returned.json()).draft;assert.equal(d3.stage,'changes');assert.match(d3.reviewNote,/distribution area/);
  const revised={...payload,areasBn:'টাঙ্গাইল',areasEn:'Tangail'};const submitted=await call('submit',revised,d3.version);const d4=(await submitted.json()).draft;
  const published=await call('publish',revised,d4.version,'admin');assert.equal(published.status,200);const d5=(await published.json()).draft;
  const live=(await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id===original.id);assert.equal(live.titleEn,payload.titleEn);assert.equal(live.areasEn,'Tangail');assert.deepEqual(live.faqs,payload.faqs);
  const next=await call('draft',{...revised,titleEn:'Unapproved second edition'},d5.version);assert.equal(next.status,200);assert.equal((await (await handleAPI(request('content'),env)).json()).projects.find(p=>p.id===original.id).titleEn,payload.titleEn);
  assert.equal((await call('publish',revised,undefined,'admin')).status,409);
  const history=await (await handleAPI(request('admin/content/history?id=winter-relief','GET',undefined,'editor'),env)).json();assert.equal(history.revisions.length,6);assert.ok(history.revisions.some(r=>r.action==='content.request-changes'));assert.equal(history.revisions.find(r=>r.action==='content.publish').payload.titleEn,payload.titleEn);
 }finally{await pg.close()}
});

test('only admins set financial targets and offline collections; reports capture verified totals immutably at publication',async()=>{
 const {pg,ex,env}=await fixture();try{
  await handleAPI(request('account','POST',{},'editor'),env);await handleAPI(request('admin/users','PATCH',{userId:'editor',role:'editor'},'admin'),env);
  const base=seed.projects.find(p=>p.id==='winter-relief');
  for(const patch of [{fundraisingTarget:10000},{offlineTotal:500},{offlineNoteEn:'Changed source'}])assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:base.id,payload:{...base,...patch},action:'draft',version:null},'editor'),env)).status,403);
  const updated={...base,fundraisingTarget:10000,offlineTotal:500,offlineSeparate:true,offlineNoteBn:'আলাদা খাতার নিশ্চিত সংগ্রহ',offlineNoteEn:'Confirmed separate ledger, excluding website payments'};
  assert.equal((await handleAPI(request('admin/content','POST',{kind:'project',id:base.id,payload:updated,action:'publish',version:null},'admin'),env)).status,200);
  const paid=await handleAPI(request('donations','POST',donation(),'alice'),env);assert.equal(paid.status,201);const payment=(await ex.query('SELECT id FROM foundation.donations'))[0];
  const report={titleBn:'সমাপ্তির প্রতিবেদন',titleEn:'Completion report',bodyBn:'হিসাব',bodyEn:'Accounts',projectId:base.id,completion:{date:'2026-11-25',expenses:[{labelBn:'কম্বল',labelEn:'Blankets',amount:100}],outcomesBn:'পরিবারের কাছে পৌঁছেছে',outcomesEn:'Delivered to families',websiteTotal:999999,offlineTotal:999999}};
  assert.equal((await handleAPI(request('admin/content','POST',{kind:'report',id:'winter-completion',payload:report,action:'submit',version:null},'editor'),env)).status,403);
  assert.equal((await handleAPI(request('admin/content','POST',{kind:'report',id:'winter-completion',payload:report,action:'publish',version:null},'admin'),env)).status,200);
  let published=(await (await handleAPI(request('content'),env)).json()).reports.find(r=>r.id==='winter-completion');assert.equal(published.completion.websiteTotal,0);assert.equal(published.completion.offlineTotal,500);assert.ok(published.completion.approvedAt);
  assert.equal((await handleAPI(request('admin/donations/'+payment.id,'PATCH',{status:'verified',matched:'on'},'admin'),env)).status,200);
  const content=await (await handleAPI(request('content'),env)).json();assert.equal(content.projects.find(p=>p.id===base.id).verifiedTotal,250.5);assert.equal(content.reports.find(r=>r.id==='winter-completion').completion.websiteTotal,0);
  const latest=(await (await handleAPI(request('admin/content','GET',undefined,'admin'),env)).json()).drafts.find(d=>d.id==='winter-completion');assert.equal((await handleAPI(request('admin/content','POST',{kind:'report',id:'winter-completion',payload:report,action:'publish',version:latest.version},'admin'),env)).status,200);published=(await (await handleAPI(request('content'),env)).json()).reports.find(r=>r.id==='winter-completion');assert.equal(published.completion.websiteTotal,250.5);
  const revision=(await (await handleAPI(request('admin/content','GET',undefined,'admin'),env)).json()).drafts.find(d=>d.id==='winter-completion');assert.equal((await handleAPI(request('admin/content','POST',{kind:'report',id:'winter-completion',payload:{...published,completion:{...published.completion,expenses:[]}},action:'draft',version:revision.version},'editor'),env)).status,403);
 }finally{await pg.close()}
});
