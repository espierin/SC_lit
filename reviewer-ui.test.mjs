import test from 'node:test';import assert from 'node:assert/strict';import {reviewPresentation} from './reviewer-ui.mjs';
test('review stages distinguish incomplete, excluded, scheduled and confirmed publication',()=>{
 assert.equal(reviewPresentation().stage,0);
 const pending=reviewPresentation({items:[{decision:'pending'},{decision:'approved'}]});assert.equal(pending.counts.pending,1);assert.equal(pending.stage,2);assert.equal(pending.complete,false);
 const excluded=reviewPresentation({items:[{decision:'excluded'}]});assert.equal(excluded.title,'All articles excluded');assert.match(excluded.next,/No post/);
 const scheduled=reviewPresentation({publication:{status:'scheduled',dueAt:'2026-11-03T05:00Z'},now:Date.parse('2026-11-01')});assert.equal(scheduled.stage,3);assert.equal(scheduled.title,'Scheduled in Buffer');
 assert.equal(reviewPresentation({publication:{status:'scheduled',dueAt:'2026-11-03T05:00Z'},now:Date.parse('2026-11-04')}).title,'Awaiting delivery confirmation');
 assert.equal(reviewPresentation({publication:{status:'sent'}}).stage,4);
});
test('unsaved and failed submissions never appear as a new confirmed publication',()=>{
 assert.equal(reviewPresentation({dirty:true}).title,'Saving your changes');assert.equal(reviewPresentation({error:'conflict'}).tone,'attention');
 for(const status of ['needs_attention','error','blocked']){const m=reviewPresentation({publication:{status}});assert.equal(m.tone,'attention');assert.notEqual(m.stage,4);assert.match(m.next,/Do not retry/)}
 assert.equal(reviewPresentation({publication:{status:'paused'}}).title,'Publication paused');
 assert.equal(reviewPresentation({publication:{status:'sent'},dirty:true}).title,'Publication confirmed');
});
