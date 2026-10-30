import {readFile, writeFile, mkdir, appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

// This integration can only act as the verified EFI Page, never as a member.
export const EFI = 'urn:li:organization:109535533';
export const SINCE = Date.parse('2026-10-30T02:02:00Z');
export const freshState = () => ({version:1, since:SINCE, postStart:0, threads:{}, pending:{}, done:{}, calls:[]});
const hash = urn => createHash('sha256').update(urn).digest('hex');
const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, c => '%'+c.charCodeAt(0).toString(16).toUpperCase());
const postUrn = value => /^urn:li:(share|ugcPost):\d+$/.test(value);
const commentUrn = value => /^urn:li:comment:\((?:urn:li:)?activity:\d+,\d+\)$/.test(value);
const isThread = value => postUrn(value) || commentUrn(value);

export function collectComments(state, parent, comments) {
  for (const comment of comments) {
    const urn = comment.commentUrn;
    if (!commentUrn(urn)) throw Error('Invalid comment identity; no reaction sent');
    if (comment.commentsSummary?.totalFirstLevelComments > 0 || comment.commentsSummary?.totalComments > 0) {
      state.threads[urn] ??= {start:0, scanned:0};
    }
    const created = comment.created?.time;
    if (!Number.isFinite(created) || created < state.since || comment.actor === EFI) continue;
    const key = hash(urn);
    if (!state.done[key]) state.pending[key] ??= {urn, parent};
  }
}

export async function run(state, {request, now=Date.now(), dryRun=false, maxCalls=12}={}) {
  if (state.version !== 1 || state.since !== SINCE) throw Error('State version/cutoff mismatch');
  state.calls = state.calls.filter(time => time > now - 86400000);
  const stats = {calls:0, liked:0, existing:0, discovered:0, pending:0, dryRun};
  const budget = Math.min(maxCalls, Math.max(0, 90-state.calls.length));
  async function api(path, options={}) {
    if (stats.calls >= budget) throw Error('INTERNAL_BUDGET');
    // Account for uncertain network outcomes too. Never retry a POST blindly.
    state.calls.push(now); stats.calls++;
    return request(path, options);
  }
  function posts(page) {
    if (!Array.isArray(page.elements)) throw Error('Invalid posts response');
    for (const post of page.elements) {
      if (post.author !== EFI || post.lifecycleState !== 'PUBLISHED') continue;
      if (!postUrn(post.id)) throw Error('Invalid EFI post identity');
      if (!state.threads[post.id]) {state.threads[post.id]={start:0,scanned:0}; stats.discovered++;}
    }
  }
  if (budget < 3) return {...stats, pending:Object.keys(state.pending).length, limited:true};
  const base = `/posts?q=author&author=${encode(EFI)}&count=100&sortBy=CREATED`;
  const latest = await api(base+'&start=0'); posts(latest);
  // Discover historical posts progressively as new comments may arrive on old posts.
  if (state.postStart > 0) {
    const older = await api(base+'&start='+state.postStart); posts(older);
    state.postStart = older.elements.length === 100 ? state.postStart+100 : 0;
  } else if (latest.elements.length === 100) state.postStart=100;

  async function react() {
    for (const [key, item] of Object.entries(state.pending)) {
      if (stats.calls+2 > budget) break;
      if (!commentUrn(item.urn) || !state.threads[item.parent]) throw Error('Unverified pending comment');
      const path = `/reactions/(actor:${encode(EFI)},entity:${encode(item.urn)})`;
      const current = await api(path, {allow404:true});
      if (current !== null) {
        // Preserve every existing reaction type, including manually chosen reactions.
        state.done[key]=now; delete state.pending[key]; stats.existing++; continue;
      }
      if (dryRun) continue;
      await api('/reactions?actor='+encode(EFI), {method:'POST', body:{root:item.urn,reactionType:'LIKE'}});
      state.done[key]=now; delete state.pending[key]; stats.liked++;
    }
  }
  await react();
  const threads = Object.keys(state.threads).sort((a,b)=>state.threads[a].scanned-state.threads[b].scanned);
  for (const parent of threads) {
    if (stats.calls >= budget) break;
    if (!isThread(parent)) throw Error('Invalid thread identity');
    const thread = state.threads[parent];
    const page = await api(`/socialActions/${encode(parent)}/comments?start=${thread.start}&count=100`, {allow404:true});
    if (page === null) {delete state.threads[parent]; for(const [key,item] of Object.entries(state.pending)) if(item.parent===parent)delete state.pending[key]; continue;}
    if (!Array.isArray(page.elements)) throw Error('Invalid comments response');
    collectComments(state,parent,page.elements);
    thread.start=page.elements.length===100 ? thread.start+100 : 0;
    thread.scanned=now;
    await react();
  }
  // Hashes are only an optimization; a GET always protects against duplicate writes after eviction.
  for(const [key,time] of Object.entries(state.done)) if(time < now-90*86400000) delete state.done[key];
  stats.pending=Object.keys(state.pending).length;
  stats.threads=Object.keys(state.threads).length;
  return stats;
}

export function client(token, fetcher=fetch) {
  if (!token) throw Error('LINKEDIN_ACCESS_TOKEN is missing');
  return async (path,{method='GET',body,allow404=false}={}) => {
    const response = await fetcher('https://api.linkedin.com/rest'+path, {
      method, redirect:'error', signal:AbortSignal.timeout(30000),
      headers:{Authorization:'Bearer '+token,'LinkedIn-Version':'202610','X-Restli-Protocol-Version':'2.0.0','Content-Type':'application/json'},
      ...(body ? {body:JSON.stringify(body)} : {})
    });
    if (response.status === 404 && allow404) return null;
    if (!response.ok) throw Error(`LinkedIn HTTP ${response.status}; stopped without retry. Check token, permissions or quota.`);
    const text=await response.text(); return text ? JSON.parse(text) : {};
  };
}

async function main() {
  const filename='.linkedin-state/state.json';
  await mkdir('.linkedin-state',{recursive:true});
  let state;
  try {state=JSON.parse(await readFile(filename,'utf8'));} catch(error) {if(error.code!=='ENOENT')throw error; state=freshState();}
  try {
    const stats=await run(state,{request:client(process.env.LINKEDIN_ACCESS_TOKEN),dryRun:process.env.DRY_RUN!=='false'});
    const summary=`EFI LinkedIn comment likes: ${JSON.stringify(stats)}`;
    console.log(summary);
    if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
  } finally {await writeFile(filename,JSON.stringify(state));}
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
