import test from 'node:test';
import assert from 'node:assert/strict';
import {EFI,SINCE,freshState,run,client} from './linkedin-comment-likes.mjs';
const post='urn:li:share:123';
const urn=id=>`urn:li:comment:(urn:li:activity:123,${id})`;
const comment=(id,extra={})=>({commentUrn:urn(id),actor:'urn:li:person:reader',created:{time:SINCE+1},...extra});
function mock(comments,{reaction=null,failWrite=false}={}) {
  const calls=[];
  return {calls,request:async(path,options={})=>{
    calls.push({path,...options});
    if(path.startsWith('/posts?'))return {elements:[{id:post,author:EFI,lifecycleState:'PUBLISHED'},{id:'urn:li:share:999',author:'urn:li:organization:999',lifecycleState:'PUBLISHED'}]};
    if(path.startsWith('/socialActions/'))return {elements:comments};
    if(options.method==='POST'){if(failWrite)throw Error('uncertain write');return {};}
    if(path.startsWith('/reactions/'))return reaction;
    throw Error('Unexpected request');
  }};
}
test('only new external comments under EFI posts get LIKE; repeated runs do not repeat writes',async()=>{
  const state=freshState(),api=mock([comment(1),comment(2,{created:{time:SINCE-1}}),comment(3,{actor:EFI}),comment(4,{created:null})]);
  const result=await run(state,{...api,now:SINCE+100});
  assert.equal(result.liked,1);
  const writes=api.calls.filter(c=>c.method==='POST');
  assert.deepEqual(writes.map(c=>c.body),[{root:urn(1),reactionType:'LIKE'}]);
  assert.ok(writes[0].path.endsWith(encodeURIComponent(EFI)));
  assert.equal(Object.keys(state.threads).length,1);
  await run(state,{...api,now:SINCE+200});
  assert.equal(api.calls.filter(c=>c.method==='POST').length,1);
});
test('existing EFI reaction is preserved and read-only mode never writes',async()=>{
  for(const options of [{reaction:{reactionType:'EMPATHY'}},{reaction:null}]){
    const api=mock([comment(1)],options);
    await run(freshState(),{...api,now:SINCE+100,dryRun:true});
    assert.equal(api.calls.filter(c=>c.method==='POST').length,0);
  }
});
test('uncertain write stays pending; next run checks LinkedIn before any retry',async()=>{
  const state=freshState(),api=mock([comment(1)],{failWrite:true});
  await assert.rejects(run(state,{...api,now:SINCE+100}),/uncertain/);
  assert.equal(Object.keys(state.pending).length,1);
  const recovery=mock([comment(1)],{reaction:{reactionType:'LIKE'}});
  await run(state,{...recovery,now:SINCE+200});
  assert.equal(Object.keys(state.pending).length,0);
  assert.equal(recovery.calls.filter(c=>c.method==='POST').length,0);
});
test('budget is enforced including manual reruns and unfinished comments resume',async()=>{
  const state=freshState(),api=mock(Array.from({length:10},(_,i)=>comment(i+1)));
  const result=await run(state,{...api,now:SINCE+100,maxCalls:6});
  assert.equal(result.calls,6); assert.equal(result.liked,2); assert.equal(result.pending,8);
  state.calls=Array(89).fill(SINCE+100);
  const blocked=await run(state,{...api,now:SINCE+200});
  assert.equal(blocked.calls,0); assert.equal(blocked.limited,true);
});
test('post and comment pagination progress is retained and nested replies are scheduled',async()=>{
  const state=freshState(); const api=mock(Array.from({length:100},(_,i)=>comment(i+1,{created:{time:SINCE-1},commentsSummary:i===0?{totalFirstLevelComments:1}:undefined})));
  await run(state,{...api,now:SINCE+100,maxCalls:3});
  assert.equal(state.threads[post].start,100);
  assert.ok(state.threads[urn(1)]);
});
test('malformed comment, wrong cutoff and HTTP errors stop safely without leaking token',async()=>{
  await assert.rejects(run(freshState(),{...mock([{commentUrn:'unsafe'}])}),/Invalid comment/);
  await assert.rejects(run({...freshState(),since:0},{...mock([])}),/cutoff/);
  const request=client('PRIVATE',async()=>({status:401,ok:false}));
  await assert.rejects(request('/posts'),error=>error.message.includes('401')&&!error.message.includes('PRIVATE'));
});
test('live LinkedIn ugcPost comment identities are preserved unchanged for reactions',async()=>{
  const identity='urn:li:comment:(urn:li:ugcPost:123,456)';
  const api=mock([comment(1,{commentUrn:identity})]);
  const stats=await run(freshState(),{...api,now:SINCE+100});
  assert.equal(stats.liked,1);
  assert.deepEqual(api.calls.find(c=>c.method==='POST').body,{root:identity,reactionType:'LIKE'});
});
