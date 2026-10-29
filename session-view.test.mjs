import test from 'node:test';
import assert from 'node:assert/strict';
import {cachedIdentity,withIdentity,IDENTITY_FRESH_MS} from './session-view.mjs';
test('a recent identity avoids a repeated display check without extending the session',()=>{
 const session={token:'local-test',expiresAt:900000},profile={email:'person@example.test',name:'Example',role:'reviewer',canAnnouncement:false,canReview:true};
 const next=withIdentity(session,profile,100000);
 assert.deepEqual(cachedIdentity(next,100001),profile);
 assert.equal(next.expiresAt,session.expiresAt);
 assert.equal(session.profile,undefined);
 assert.equal(cachedIdentity(next,100000+IDENTITY_FRESH_MS),null);
});
test('expired, missing, mismatched and future-dated identity hints are ignored',()=>{
 const next=withIdentity({token:'local-test',expiresAt:200000},{email:'person@example.test',name:'Example',role:'admin',canAnnouncement:true},100000);
 for(const value of [null,{...next,token:null},{...next,expiresAt:100001},{...next,email:'different@example.test'},{...next,profileCheckedAt:100002}])assert.equal(cachedIdentity(value,100001),null);
});

test('old cached identities without an Announcement permission require a fresh server check',()=>{
 const session=withIdentity({token:'local-test',expiresAt:200000},{email:'person@example.test',name:'Example',role:'admin'},100000);
 assert.equal(cachedIdentity(session,100001),null);
});
