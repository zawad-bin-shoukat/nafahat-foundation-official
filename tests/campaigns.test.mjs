import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCampaignSchedule,campaignPhase,remainingTime,toDhakaInput,fromDhakaInput} from '../lib/campaigns.js';
import {signMedia,validateMediaRequest} from '../server/media.js';
const schedule={campaignStatus:'ongoing',startsAt:'2026-11-23T00:00:00Z',endsAt:'2026-11-25T00:00:00Z'};
test('campaign countdown respects exact start and end boundaries and Bangladesh time',()=>{
 assert.equal(campaignPhase({},Date.now()),'unscheduled');assert.equal(campaignPhase(schedule,Date.parse(schedule.startsAt)-1),'upcoming');assert.equal(campaignPhase(schedule,Date.parse(schedule.startsAt)),'ongoing');assert.equal(campaignPhase(schedule,Date.parse(schedule.endsAt)),'ended');assert.equal(campaignPhase({...schedule,campaignStatus:'completed'},Date.parse(schedule.startsAt)),'ended');assert.equal(campaignPhase({...schedule,campaignStatus:'planned'},Date.parse(schedule.startsAt)),'ongoing');assert.deepEqual(remainingTime(schedule.endsAt,Date.parse('2026-11-23T22:58:57Z')),[1,1,1,3]);assert.deepEqual(remainingTime(schedule.endsAt,Date.parse(schedule.endsAt)+1000),[0,0,0,0]);assert.ok(validateCampaignSchedule({campaignStatus:'ongoing'}));assert.ok(validateCampaignSchedule({...schedule,endsAt:schedule.startsAt}));assert.ok(validateCampaignSchedule({...schedule,startsAt:'invalid'}));assert.equal(toDhakaInput(schedule.startsAt),'2026-11-23T06:00');assert.equal(fromDhakaInput('2026-11-23T06:00'),'2026-11-23T00:00:00.000Z');
});
test('storage signing fails honestly without configuration and rejects unsafe upload metadata',async()=>{
 assert.equal((await signMedia({},{})).status,503);
 const valid={contentId:'winter-relief',kind:'project',contentType:'image/webp',size:1024};assert.equal(validateMediaRequest(valid),null);
 for(const patch of [{contentId:'../x'},{kind:'users'},{contentType:'image/svg+xml'},{size:0},{size:3*1024*1024}])assert.ok(validateMediaRequest({...valid,...patch}));
});
test('signed uploads use a unique path and never return the server storage key',async t=>{
 const secret='sb_secret_test_private',calls=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url:String(url),method:options.method});assert.equal(options.headers.get?options.headers.get('authorization'):options.headers.Authorization,'Bearer '+secret);if(String(url).includes('/bucket/'))return Response.json({id:'campaign-media',name:'campaign-media',public:true});return Response.json({url:'/object/upload/sign/campaign-media/project/winter-relief/photo.webp?token=temporary-upload-token'})});
 const result=await signMedia({SUPABASE_URL:'https://media-test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:secret},{contentId:'winter-relief',kind:'project',contentType:'image/webp',size:1024});assert.equal(result.token,'temporary-upload-token');assert.match(result.path,/^project\/winter-relief\/[0-9a-f-]+\.webp$/);assert.match(result.publicUrl,/\/object\/public\/campaign-media\/project\/winter-relief\//);assert.ok(!JSON.stringify(result).includes(secret));assert.equal(calls.length,2);
});

test('first authorized upload creates only the configured public image bucket with upload limits',async t=>{
 const writes=[];t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(String(url).includes('/bucket/')&&(!options.method||options.method==='GET'))return Response.json({message:'Bucket not found',statusCode:'404',error:'not_found'},{status:404});
  if(String(url).endsWith('/bucket')&&options.method==='POST'){writes.push(JSON.parse(options.body));return Response.json({name:'campaign-media'})}
  return Response.json({url:'/object/upload/sign/campaign-media/new.webp?token=upload-token'});
 });
 const result=await signMedia({SUPABASE_URL:'https://media-test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test_key'},{contentId:'winter-relief',kind:'project',contentType:'image/webp',size:4096});assert.equal(result.token,'upload-token');assert.equal(writes.length,1);assert.equal(writes[0].id,'campaign-media');assert.equal(writes[0].public,true);assert.deepEqual(writes[0].allowed_mime_types,['image/webp']);assert.equal(Number(writes[0].file_size_limit),2*1024*1024);
});
