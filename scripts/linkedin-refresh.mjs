// OAuth credentials and refreshed access tokens exist in runner memory only.
export async function refreshAccessToken(env=process.env, fetcher=fetch) {
  const credentials={grant_type:'refresh_token',refresh_token:env.LINKEDIN_REFRESH_TOKEN,
    client_id:env.LINKEDIN_CLIENT_ID,client_secret:env.LINKEDIN_CLIENT_SECRET};
  for(const [key,value] of Object.entries(credentials))if(!value)throw Error('LinkedIn refresh credential missing: '+key);
  let response;
  try {
    response=await fetcher('https://www.linkedin.com/oauth/v2/accessToken',{
      method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),
      headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(credentials)
    });
  } catch {throw Error('LinkedIn token refresh connection failed; no social actions attempted');}
  if(!response.ok)throw Error(`LinkedIn token refresh HTTP ${response.status}; check app credentials or reauthorize the app`);
  let result;
  try {result=await response.json();}catch {throw Error('Invalid LinkedIn token refresh response');}
  if(typeof result.access_token!=='string'||result.access_token.length<30||!Number.isFinite(result.expires_in)||result.expires_in<=0)
    throw Error('LinkedIn did not return a usable refreshed access token');
  // Keep the original, year-long authorization in GitHub Secrets. LinkedIn can
  // return a different encoded refresh token; that does not extend its expiry.
  // The live integration verifies reuse of the original secret across runs.
  if(result.scope){
    const scopes=new Set(result.scope.split(/[ ,]+/));
    if(!['r_organization_social','r_organization_social_feed','w_organization_social_feed'].every(scope=>scopes.has(scope)))
      throw Error('Refreshed LinkedIn token is missing required EFI permissions');
  }
  const refreshExpires=Number.isFinite(result.refresh_token_expires_in)?result.refresh_token_expires_in:null;
  return {accessToken:result.access_token,expiresIn:result.expires_in,refreshExpiresIn:refreshExpires};
}
