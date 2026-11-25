import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fundingSummary,validateProjectDetails,validateCompletionReport} from '../lib/project-details.js';
test('fundraising progress separates website and offline money, handles decimals and never exceeds 100 percent',()=>{
 assert.deepEqual(fundingSummary({verifiedTotal:250.5,offlineTotal:500,fundraisingTarget:1000}),{website:250.5,offline:500,total:750.5,target:1000,remaining:249.5,percent:75});
 assert.equal(fundingSummary({verifiedTotal:2000,fundraisingTarget:1000}).percent,100);assert.equal(fundingSummary({verifiedTotal:2000,fundraisingTarget:1000}).remaining,0);assert.equal(fundingSummary({}).target,0);
});
test('publication rejects unsupported financial values and incomplete FAQs while drafts can remain incomplete',()=>{
 for(const patch of [{fundraisingTarget:-1},{fundraisingTarget:'500'},{fundraisingTarget:1.001},{offlineTotal:NaN},{offlineTotal:100},{offlineTotal:100,offlineSeparate:true,offlineNoteBn:'উৎস'}])assert.ok(validateProjectDetails(patch));
 const partial={faqs:[{questionBn:'',questionEn:'',answerBn:'',answerEn:''}]};assert.ok(validateProjectDetails(partial));assert.equal(validateProjectDetails(partial,{partial:true}),null);assert.ok(validateProjectDetails({faqs:Array(13).fill({})}));
 const c={projectId:'winter-relief',completion:{date:'2026-11-25',expenses:[{labelBn:'ব্যয়',labelEn:'Expense',amount:100}],outcomesBn:'সম্পন্ন',outcomesEn:'Complete'}};assert.equal(validateCompletionReport(c),null);for(const patch of [{date:'2026-02-31'},{expenses:[{labelBn:'ব্যয়',labelEn:'Expense',amount:-1}]},{outcomesBn:''}])assert.ok(validateCompletionReport({...c,completion:{...c.completion,...patch}}));
});
