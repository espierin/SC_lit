import test from 'node:test';
import assert from 'node:assert/strict';
import {finalDecisionHint,publicationTime,publicationIssue} from './reviewer-guidance.mjs';
test('the final-decision warning distinguishes normal, late, paused, excluded and read-only reviews',()=>{
 const base={pending:1,approved:1,canReview:true,status:'draft',dueAt:'2026-11-03T05:00Z',now:Date.parse('2026-11-01')};
 assert.match(finalDecisionHint(base),/scheduled through Buffer/);
 assert.match(finalDecisionHint({...base,now:Date.parse('2026-11-04')}),/submitted immediately/);
 assert.match(finalDecisionHint({...base,paused:true}),/publication is paused/);
 assert.match(finalDecisionHint({...base,approved:0}),/Excluding all articles creates no post/);
 for(const change of [{pending:0},{pending:2},{canReview:false},{status:'sent'},{status:'needs_attention'}])assert.equal(finalDecisionHint({...base,...change}),'');
});
test('displayed publication time follows the saved schedule and Amsterdam daylight saving',()=>{
 assert.equal(publicationTime('2026-10-30',{day:2,time:'06:00'}),'2026-11-03T05:00:00.000Z');
 assert.equal(publicationTime('2027-03-26',{day:2,time:'06:00'}),'2027-03-30T04:00:00.000Z');
 assert.equal(publicationTime('2026-10-30',{day:2,time:'09:30'}),'2026-11-03T08:30:00.000Z');
 assert.equal(publicationTime(null,{day:2,time:'06:00'}),null);
});
test('publication problems give a concrete action without assuming a failed write did not send',()=>{
 assert.match(publicationIssue('blocked','Shorten to 3000 characters').action,/Shorten/);
 assert.match(publicationIssue('error','DOI links only').action,/direct article DOI/);
 assert.match(publicationIssue('error','Published history unavailable').action,/administrator/);
 assert.match(publicationIssue('needs_attention','Connection lost').action,/does not prove/);
});
