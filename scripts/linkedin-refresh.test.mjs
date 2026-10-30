import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshAccessToken} from './linkedin-refresh.mjs';
const env={LINKEDIN_REFRESH_TOKEN:'private-refresh',LINKEDIN_CLIENT_ID:'app',LINKEDIN_CLIENT_SECRET:'private-secret'};
const access='A'.repeat(100);
const success=(extra={})=>({ok:true,json:async()=>({access_token:access,expires_in:5184000,refresh_token:env.LINKEDIN_REFRESH_TOKEN,refresh_token_expires_in:31500000,...extra})});
test('official form-encoded refresh is used and only an in-memory token is returned',async()=>{
  const result=await refreshAccessToken(env,async(url,options)=>{
    assert.equal(url,'https://www.linkedin.com/oauth/v2/accessToken');
    assert.equal(options.method,'POST'); assert.equal(options.redirect,'error');
    assert.equal(options.headers['Content-Type'],'application/x-www-form-urlencoded');
    assert.equal(options.body.get('grant_type'),'refresh_token');
    assert.equal(options.body.get('client_secret'),env.LINKEDIN_CLIENT_SECRET);
    return success();
  });
  assert.deepEqual(result,{accessToken:access,expiresIn:5184000,refreshExpiresIn:31500000});
});
test('missing or revoked credentials stop without exposing tokens or raw response data',async()=>{
  await assert.rejects(refreshAccessToken({},async()=>{throw Error('must not call')}),/credential missing/);
  await assert.rejects(refreshAccessToken(env,async()=>({ok:false,status:400,json:async()=>env})),error=>error.message.includes('400')&&!error.message.includes('private'));
  await assert.rejects(refreshAccessToken(env,async()=>{throw Error('private-secret')}),error=>!error.message.includes('private'));
});
test('invalid responses, unexpected rotation and reduced permissions stop before social actions',async()=>{
  await assert.rejects(refreshAccessToken(env,async()=>success({access_token:null})),/usable/);
  await assert.rejects(refreshAccessToken(env,async()=>success({refresh_token:'different'})),/changed refresh token/);
  await assert.rejects(refreshAccessToken(env,async()=>success({scope:'r_organization_social'})),/missing required/);
  await assert.rejects(refreshAccessToken(env,async()=>({ok:true,json:async()=>{throw Error('private')}})),/Invalid LinkedIn/);
});
