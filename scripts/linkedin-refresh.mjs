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
  // LinkedIn documents a fixed refresh token with a fixed, non-renewing lifetime.
  // A changed token requires secure persistence before allowing unattended runs.
  if(result.refresh_token && result.refresh_token!==credentials.refresh_token)
    throw Error('LinkedIn returned a changed refresh token; secure credential update required');
  if(result.scope){
    const scopes=new Set(result.scope.split(/[ ,]+/));
    if(!['r_organization_social','r_organization_social_feed','w_organization_social_feed'].every(scope=>scopes.has(scope)))
      throw Error('Refreshed LinkedIn token is missing required EFI permissions');
  }
  const refreshExpires=Number.isFinite(result.refresh_token_expires_in)?result.refresh_token_expires_in:null;
  return {accessToken:result.access_token,expiresIn:result.expires_in,refreshExpiresIn:refreshExpires};
}
