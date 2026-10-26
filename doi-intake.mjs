import {newsletterDoi} from './newsletter-core.mjs';
// Public metadata only. No AI API, publisher login, URL redirects or publishing.
export function doiIntakeText(value){return String(value||'').replace(/[\u2013\u2014\u2015]/g,' - ').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<\/(?:jats:)?(?:p|sec|title)>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&(?:amp|lt|gt|quot|apos);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[x])).replace(/\r/g,'').trim().slice(0,50000);}
export async function resolveArticleDoi(raw,request=fetch){
 const doi=newsletterDoi(raw),identifier=doi.slice('https://doi.org/'.length);
 const urls=['https://api.crossref.org/works/'+encodeURIComponent(identifier),'https://www.ebi.ac.uk/europepmc/webservices/rest/search?'+new URLSearchParams({query:'DOI:"'+identifier+'"',format:'json',resultType:'core',pageSize:'3'})];
 const results=await Promise.allSettled(urls.map(async url=>{const response=await request(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Metadata lookup failed ('+response.status+').');return response.json();}));
 const cross=results[0].status==='fulfilled'?results[0].value.message:null;
 const matching=value=>{try{return newsletterDoi(value)===doi}catch{return false}};
 const c=cross&&matching(cross.DOI)?cross:null;
 const pmc=results[1].status==='fulfilled'?results[1].value.resultList?.result?.find(v=>matching(v.doi)):null;
 const title=doiIntakeText(c?.title?.[0]||pmc?.title);if(!title)throw Error('No matching article metadata found. Check the DOI or retry later.');
 const authors=c?.author?.map(a=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean)||pmc?.authorList?.author?.map(a=>a.fullName).filter(Boolean)||[];
 const parts=(c?.['published-online']||c?.published||c?.['published-print'])?.['date-parts']?.[0];
 const date=parts?parts.map((v,i)=>i?String(v).padStart(2,'0'):String(v)).join('-'):pmc?.firstPublicationDate||null;
 const abstract=doiIntakeText(pmc?.abstractText||c?.abstract);
 const notices=(c?.['update-to']||[]).map(v=>({type:v.type||'update',doi:v.DOI||null}));
 return {doi,title,authors,journal:doiIntakeText(c?.['container-title']?.[0]||pmc?.journalInfo?.journal?.title),date,abstract,abstractSource:abstract?(pmc?.abstractText?'Europe PMC':'Crossref'):null,sources:[...(c?['Crossref']:[]),...(pmc?['Europe PMC']:[])],retrievedAt:new Date().toISOString(),fullTextAvailable:pmc?.isOpenAccess==='Y',fullTextChecked:false,notices,retracted:pmc?.isRetracted==='Y'||notices.some(n=>/retract/i.test(n.type)),citation:[authors.length?(authors.slice(0,3).join(', ')+(authors.length>3?' et al.':'')):'Author metadata unavailable',title,doiIntakeText(c?.['container-title']?.[0]||pmc?.journalInfo?.journal?.title),date||'Publication date unavailable'].filter(Boolean).join('. ')};
}
export async function addManualArticle(record,raw,actor,request=fetch){
 const doi=newsletterDoi(raw);
 if(record.candidates.some(c=>newsletterDoi(c.doi)===doi)||(record.manualArticles||[]).some(c=>c.doi===doi))throw Error('This DOI is already included in this duty block.');
 if((record.manualArticles||[]).length>=50)throw Error('This duty block already contains 50 manually added articles.');
 const metadata=await resolveArticleDoi(doi,request);
 return {...record,manualArticles:[...(record.manualArticles||[]),{doi,metadata,addedAt:new Date().toISOString(),addedBy:actor.email,origin:'sc_member',status:metadata.retracted?'needs_attention':'awaiting_reading_guide',outsideDutyWindow:!!metadata.date&&(metadata.date<record.period.start||metadata.date>record.period.end),preparation:{bibliography:'complete',abstract:metadata.abstract?'retrieved':'unavailable',fullText:'not_checked',readingGuide:'queued',automaticPreparationActive:false}}]};
}
