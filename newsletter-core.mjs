import {assertPostLinks} from './url-policy.mjs';
// Editorial preparation only. This module has no publishing transport.
export const NEWSLETTER_FIELDS=[
 {key:'title',label:'Headline',hint:'A specific, measured headline; no claim stronger than the evidence.'},
 {key:'standfirst',label:'In brief',hint:'Describe the question, dataset and scope so the reader can assess whether the full paper is relevant.'},
 {key:'context',label:'The broader context',hint:'The problem this work addresses and its place in the field.'},
 {key:'novelty',label:'What is new?',hint:'Separate the new contribution from established knowledge.'},
 {key:'methods',label:'How the study was done',hint:'Design, population or model, comparator and key measurements.'},
 {key:'findings',label:'What the study found',hint:'Verified results, denominators and uncertainty. No invented effect sizes.'},
 {key:'strengths',label:'What the analysis supports',hint:'Explain the scope of the data, without a peer-review verdict or a quality score.'},
 {key:'limitations',label:'Scope of the findings',hint:'Explain what this design and dataset do and do not establish; no judgement of publishability.'},
 {key:'implications',label:'How the findings fit the literature',hint:'Describe the relationship to published evidence. No endorsement or advice from EFI or the reviewer.'},
 {key:'nextSteps',label:'Perspectives for further understanding',hint:'Describe gaps and uncertainties; do not prescribe clinical, medical or scientific actions.'},
 {key:'takeHome',label:'At a glance',hint:'A neutral summary of what is and is not established. No recommendations, including when findings appear strong.'},
 {key:'discussion',label:'Further research opportunities for our community',hint:'Describe research perspectives arising from the data; no research recommendations, priorities or prescribed actions from EFI or the reviewer.'}
];
export const NEWSLETTER_WEIGHTS={relevance:35,impact:30,novelty:20,evidence:15};
export const NEWSLETTER_CHECKS=['sources','claims','limitations','conflicts','neutrality'];
export const NEWSLETTER_NEUTRALITY='EFI and the reviewer provide neutral summaries of published research, not clinical, medical or scientific advice. No endorsement, recommended use or prescribed action. This is an objective reading guide, not peer review or an assessment of publishability. Help readers understand the question, data, results and interpretive boundaries and assess the relevance of reading the full paper. Authors’ interpretations are attributed to the authors and are not adopted as EFI positions.';
export function newsletterAdviceFlags(text){
 const patterns=[/\b(?:we|EFI|the reviewer)\s+(?:recommend|advise|suggest|endorse)\b/gi,/\bour\s+(?:suggested|recommended|preferred)\s+(?:use|approach|practice|strategy)\b/gi,/\b(?:you|clinicians|laboratories|researchers|readers)\s+(?:should|must|ought to)\b/gi,/\b(?:should|must)\s+be\s+(?:used|adopted|implemented|preferred)\b/gi];
 return patterns.flatMap(pattern=>[...String(text).matchAll(pattern)].map(match=>match[0]));
}
export const NEWSLETTER_NOTICE='This research summary does not constitute clinical, medical or scientific advice, or an endorsement by EFI or the reviewer.';
export const NEWSLETTER_TAGS='#EFI #Scientific #Committee #Histocompatibility #Immunogenetics #JournalClub';
export function newsletterSelection(prior,candidateId,member,actor,now=new Date()){
 if(prior?.candidateId===candidateId)return prior;
 if(!member?.name||!member.email)throw Error('Assign an SC member to this duty block before saving the selection.');
 const selectedDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 return {candidateId,memberName:member.name,memberEmail:member.email,memberId:member.memberId||null,selectedAt:now.toISOString(),selectedDate,selectedBy:actor.email,timezone:'Europe/Amsterdam'};
}
export function newsletterSelectedCandidate(candidate,selection){return {...candidate,selection:selection?.candidateId===candidate.id?selection:null};}
export function newsletterPickedLine(candidate){
 const value=candidate.selection;if(!value?.memberName||!value.selectedDate)return 'Picked by  -  selection not yet saved';
 const date=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',day:'numeric',month:'long',year:'numeric'}).format(new Date(value.selectedDate+'T12:00:00Z'));
 return 'Picked by '+value.memberName+', member of the Scientific Committee of the European Federation for Immunogenetics (EFI)  -  '+date;
}
export function newsletterDoi(raw){
 const value=String(raw||'').trim().replace(/^doi:\s*/i,'').replace(/^https?:\/\/(?:dx\.)?doi.org\//i,'');
 if(!/^10\.\d{4,9}\/[^\s?#]+$/i.test(value))throw Error('A valid article DOI is required.');
 return 'https://doi.org/'+value.toLowerCase();
}
export function newsletterRank(candidate){
 let total=0;for(const [key,weight]of Object.entries(NEWSLETTER_WEIGHTS)){
  const value=candidate.scores?.[key];if(!Number.isInteger(value)||value<1||value>5)throw Error('Editorial scores must be integers from 1 to 5.');
  if(!candidate.reasons?.[key]?.trim())throw Error('Every editorial score needs a rationale.');total+=value/5*weight;
 }return Math.round(total);
}
export function newsletterOrder(candidates){return [...candidates].sort((a,b)=>newsletterRank(b)-newsletterRank(a)||a.doi.localeCompare(b.doi));}
export function newsletterCoverage(candidate){
 const filled=NEWSLETTER_FIELDS.filter(f=>candidate.fields?.[f.key]?.text?.trim()).length;
 return {filled,total:NEWSLETTER_FIELDS.length,percent:Math.round(100*filled/NEWSLETTER_FIELDS.length),meaning:'Field coverage, not scientific validation or a guarantee of reviewer workload.'};
}
export function newsletterValidateCandidate(candidate){
 if(!candidate||typeof candidate.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(candidate.id))throw Error('Invalid candidate identifier.');
 newsletterDoi(candidate.doi);newsletterRank(candidate);
 if(!candidate.citation?.trim()||!Array.isArray(candidate.sources)||!candidate.sources.length)throw Error('Citation and evidence sources are required.');
 const ids=new Set();for(const source of candidate.sources){if(!source.id||ids.has(source.id)||!['full_text','abstract','prior_selection'].includes(source.access))throw Error('Invalid evidence source.');ids.add(source.id);newsletterDoi(source.doi);if(!source.checkedAt||!source.location?.trim())throw Error('Record the source location and retrieval date.');}
 for(const field of NEWSLETTER_FIELDS){const value=candidate.fields?.[field.key];if(!value||typeof value.text!=='string'||!value.text.trim()||value.text.length>8000||!['reported','editorial'].includes(value.kind)||!Array.isArray(value.sourceRefs)||!value.sourceRefs.length||value.sourceRefs.some(ref=>!ids.has(ref)))throw Error('Every field needs text, an evidence type and valid source references.');}
 if(!Array.isArray(candidate.openQuestions))throw Error('Record unresolved evidence questions, even when empty.');
 newsletterPlain(candidate);return candidate;
}
export function newsletterApprovalIssues(candidate){
 const issues=[];if(newsletterCoverage(candidate).percent!==100)issues.push('Complete every editorial field.');
 if(candidate.eligible===false)issues.push('This article is no longer eligible in the current duty-block shortlist.');
 if(!candidate.sources?.some(s=>s.access==='full_text'))issues.push('Check the full article before approving.');
 if(candidate.openQuestions?.length)issues.push('Resolve the recorded evidence questions.');
 if(newsletterAdviceFlags(Object.values(candidate.fields||{}).map(f=>f.text).join('\n')).length)issues.push('Remove advice or endorsement wording; EFI and the reviewer must remain neutral.');
 for(const check of NEWSLETTER_CHECKS)if(candidate.checks?.[check]!==true)issues.push('Confirm reviewer check: '+check+'.');
 return issues;
}
export function newsletterPeriod(year,block){
 const monday=week=>{const d=new Date(Date.UTC(year,0,4,12));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1+(week-1)*7);return d;};
 const first=monday(block.startWeek),last=monday(block.endWeek);last.setUTCDate(last.getUTCDate()+6);
 const date=d=>d.toISOString().slice(0,10);
 return {id:year+'-B'+String(block.id+1).padStart(2,'0'),year,blockId:block.id,start:date(first),end:date(last),startWeek:block.startWeek,endWeek:block.endWeek,ownerEmail:block.email,ownerMemberId:block.memberId||null,timezone:'Europe/Amsterdam',cadence:'duty_block'};
}
export function newsletterPreparationDue(period,now=new Date()){
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const lastFriday=new Date(period.end+'T12:00:00Z');lastFriday.setUTCDate(lastFriday.getUTCDate()-2);
 return day>=lastFriday.toISOString().slice(0,10)&&day<=period.end;
}
export function newsletterCollect(editions,reviews,period){
 const collected=new Map();for(const edition of editions){if(edition.date<period.start||edition.date>period.end)continue;
  for(const item of edition.items){const state=reviews[edition.id]?.items?.[item.id];if(state?.decision==='excluded')continue;
   const doi=newsletterDoi(item.doi);const old=collected.get(doi);const occurrence={editionId:edition.id,itemId:item.id,date:edition.date,decision:state?.decision||'pending'};
   if(old)old.occurrences.push(occurrence);else collected.set(doi,{doi,text:state?.text||item.text,occurrences:[occurrence]});
  }
 }return [...collected.values()];
}
export function newsletterMerge(prior,generated){
 const seen=new Set(),candidateIds=new Set();for(const c of generated){newsletterValidateCandidate(c);const doi=newsletterDoi(c.doi);if(seen.has(doi)||candidateIds.has(c.id))throw Error('Duplicate article DOI or identifier.');seen.add(doi);candidateIds.add(c.id);}
 const candidates=generated.map(c=>{
  const old=prior?.candidates?.find(x=>newsletterDoi(x.doi)===newsletterDoi(c.doi));
  // A preparation rerun must never overwrite a reviewer-edited candidate or approval.
  return old?{...old,occurrences:c.occurrences||old.occurrences,eligible:true,preparedSuggestion:c}:{...c,eligible:true,checks:Object.fromEntries(NEWSLETTER_CHECKS.map(k=>[k,false])),approvedAt:null,approvedBy:null};
 });
 for(const old of prior?.candidates||[])if(!seen.has(newsletterDoi(old.doi)))candidates.push({...old,eligible:false,withdrawnReason:'Not in the current eligible article set. Editorial text retained for history.',approvedAt:null,approvedBy:null});
 return newsletterOrder(candidates);
}
export const newsletterEscape=s=>String(s??'').replace(/[\u2013\u2014\u2015]/g,' - ').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function newsletterPlain(candidate){
 const text=candidate.fields.title.text+'\n\n'+newsletterPickedLine(candidate)+'\n\nOriginal paper\n'+candidate.citation+'\n'+newsletterDoi(candidate.doi)+'\n\n'+NEWSLETTER_FIELDS.filter(f=>f.key!=='title').map(f=>f.label+'\n'+candidate.fields[f.key].text).join('\n\n')+'\n\n'+NEWSLETTER_TAGS+'\n\n'+NEWSLETTER_NOTICE;
 if(newsletterAdviceFlags(text).length)throw Error('Export blocked: remove advice or endorsement wording. EFI and the reviewer provide neutral research summaries only.');
 // URLs in the publication body must be canonical article DOIs only.
 const urls=text.match(/(?:https?:\/\/|www\.)[^\s<>"']+/gi)||[];for(const url of urls){const clean=url.replace(/[.,;!)]+$/,'');if(!/^https:\/\/doi.org\/10\.\d{4,9}\/[^\s?#]+$/i.test(clean))throw Error('Only canonical DOI links are allowed in newsletter text.');}
 if(/(?:github\.com|github\.io|chatgpt\.site)/i.test(text))throw Error('Project links must not appear in publication text.');
 return assertPostLinks(text.replace(/[\u2013\u2014\u2015]/g,' - '));
}
export function newsletterBody(candidate){
 newsletterPlain(candidate);const e=newsletterEscape;
 const reference='<section class="paper-details"><p><strong>Original paper</strong><br>'+e(candidate.citation)+'</p><p><a href="'+e(newsletterDoi(candidate.doi))+'">'+e(newsletterDoi(candidate.doi))+'</a></p></section><p class="selection-attribution">'+e(newsletterPickedLine(candidate))+'</p>';
 return NEWSLETTER_FIELDS.map(f=>f.key==='title'?'<h1>'+e(candidate.fields[f.key].text)+'</h1>'+reference:f.key==='standfirst'?'<p class="standfirst">'+e(candidate.fields[f.key].text)+'</p>':'<section class="story-section'+(f.key==='takeHome'?' takeaway':'')+'"><h2>'+e(f.label)+'</h2>'+candidate.fields[f.key].text.split(/\n\s*\n/).map(p=>'<p>'+e(p).replace(/\n/g,'<br>')+'</p>').join('')+'</section>').join('')+'<p class="tags">'+NEWSLETTER_TAGS+'</p><p class="disclaimer"><em>'+NEWSLETTER_NOTICE+'</em></p>';
}
export function newsletterHandoff(candidate){
 return {route:'linkedin_native_editor',automaticPublishingSupported:false,organizationId:'109535533',newsletterId:null,status:'not_activated',title:candidate.fields.title.text,html:newsletterBody(candidate).replace(/ class="[^"]*"/g,'').replace(/<\/?section[^>]*>/g,''),text:newsletterPlain(candidate),cover:'newsletter-linkedin-cover.png',instructions:['Open LinkedIn as the EFI Page (109535533).','Choose Write article, then the intended EFI newsletter; create it only after explicit activation approval.','Paste the title separately. Paste formatted body from In brief onward; upload the cover separately.','Inspect the LinkedIn preview, formatting, DOI links and Page identity.','An authorised Page administrator publishes or schedules in LinkedIn. This export does not send anything.']};
}
