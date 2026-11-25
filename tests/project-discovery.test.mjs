import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterProjects,projectYears,projectDate,projectCategory,projectStatus,documentedImpact,journeyEntries,journeyPreview} from '../lib/project-discovery.js';
import {validateProjectDetails} from '../lib/project-details.js';
import {seed} from '../lib/initial-content.js';
const now=Date.parse('2026-11-25T06:00:00Z');

test('project filters combine year, category, status and bilingual search without changing records',()=>{
 const before=structuredClone(seed.projects);
 assert.deepEqual(filterProjects(seed.projects,{status:'ongoing'},now).map(p=>p.id),['winter-relief']);
 assert.deepEqual(filterProjects(seed.projects,{year:'2025',category:'environment',status:'past',search:'মাদরাসা'},now).map(p=>p.id),['tree-plantation-2025']);
 assert.deepEqual(filterProjects(seed.projects,{year:'2026',category:'dawah',status:'past',search:' QUR’AN '},now).map(p=>p.id),['quran-campaign-2026']);
 assert.equal(filterProjects(seed.projects,{year:'2025',status:'ongoing'},now).length,0);
 assert.equal(filterProjects(seed.projects,{search:'not-a-real-project'},now).length,0);
 assert.deepEqual(filterProjects(seed.projects,{year:'undated'},now).map(p=>p.id),['learning-circles','community']);
 assert.deepEqual(projectYears(seed.projects),['2026','2025']);assert.deepEqual(seed.projects,before);
});
test('dates respect Bangladesh year boundaries and never invent a day for month-only records',()=>{
 assert.equal(projectDate({startsAt:'2025-12-31T18:00:00Z'}),'2026-01-01');
 assert.equal(projectDate({publishedAt:'2025-03'}),'2025-03');
 assert.equal(projectDate({publishedAt:'2025-02-31'}),'');
 assert.equal(projectDate({publishedAt:'2025-13'}),'');
 assert.equal(projectStatus({campaignStatus:'ongoing',endsAt:new Date(now).toISOString()},now),'past');
 assert.equal(projectStatus({campaignStatus:'planned',startsAt:'2026-12-01T00:00:00Z',endsAt:'2026-12-10T00:00:00Z'},now),'upcoming');
 assert.equal(projectStatus({},now),'regular');
 assert.equal(projectCategory({id:'new-tree-project',kind:'community',activityCategory:'environment'}),'environment');
 assert.ok(validateProjectDetails({activityCategory:'unsupported'}));assert.equal(validateProjectDetails({activityCategory:'dawah'}),null);
});
test('impact remains sourced to separate activities and does not treat future or incomplete campaigns as achieved results',()=>{
 const results=documentedImpact(seed);assert.deepEqual(results.map(item=>item.value),[54,120,22,41]);
 assert.ok(results.every(item=>item.projectId!=='quran-campaign-2026'&&item.projectId!=='winter-relief'));
 const withoutSource={...seed,projects:seed.projects.map(p=>({...p,reportUrl:undefined}))};assert.deepEqual(documentedImpact(withoutSource),[]);
});
test('journey orders past projects and events, keeps uncertain days unspecified and excludes active or future work',()=>{
 const content={...seed,events:[...seed.events,{id:'future',status:'past',publishedAt:'2027-01-01'},{id:'invalid',status:'past',publishedAt:'2025-02-31'}]};
 const entries=journeyEntries(content,now);assert.equal(entries[0].id,'daily-labourers-meal-2025');
 assert.equal(entries.find(entry=>entry.id==='ramadan-food-gifts-2025').journeyDate,'2025-03');
 for(const id of ['winter-relief','future','invalid'])assert.ok(!entries.some(entry=>entry.id===id));
 assert.ok(entries.some(entry=>entry.id==='members-reunion-september-2025'&&entry.entryKind==='event'));
 assert.deepEqual(entries.map(entry=>entry.journeyDate),entries.map(entry=>entry.journeyDate).sort());
 assert.equal(journeyPreview(entries).length,6);
 assert.equal(new Set(entries.map(entry=>entry.entryKind+':'+entry.id)).size,entries.length);
});
