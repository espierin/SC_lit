import {currentUser,authHeaders,onAuthChange} from './auth.js?v=hold7';

const API='https://efi-journal-club-review-store.espierin.chatgpt.site';
const section=document.createElement('section');
section.className='preprints';
section.innerHTML='<h2>Preprint shortlist · internal review</h2><p id="preprint-status" role="status">Loading screening report…</p><div id="preprint-items"></div>';
document.querySelector('#protected-content footer')?.before(section);
const status=section.querySelector('#preprint-status'),list=section.querySelector('#preprint-items');
const elt=(tag,text)=>{const element=document.createElement(tag);element.textContent=text;return element};
let report;

async function load(){
 if(!currentUser()){list.replaceChildren();return}
 try{
  const response=await fetch(API+'/preprint-screening',{headers:authHeaders(),cache:'no-store'});
  if(!response.ok)throw Error('Shortlist unavailable');
  report=await response.json();render();
 }catch(error){status.textContent=error.message}
}

function render(){
 list.replaceChildren();
 if(!report?.report){status.textContent='No preprint screening report yet.';return}
 const data=report.report;
 status.textContent=`Screened ${data.as_of}: ${data.metadata_count} records, ${data.screened_count} abstract matches. On the radar: ${data.radar_enabled?'enabled':'paused'}. Decisions never publish automatically.`;
 for(const item of data.selected){
  const r=item.record,full=item.full_text,card=elt('article','');card.className='preprint-card';
  card.append(elt('h3',r.title),elt('p',`${r.server} · ${r.date} · Full text: ${full.status} · ${item.topics.join(', ')}`));
  const link=elt('a','Open preprint ↗');link.href='https://doi.org/'+r.doi;link.target='_blank';link.rel='noopener noreferrer';card.append(link);
  const details=document.createElement('details');details.append(elt('summary','Abstract and full-text evidence'),elt('p',r.abstract||''));
  if(full.status==='readable'){
   for(const s of full.sections.slice(0,8))details.append(elt('h4',s.title),elt('p',s.excerpt));
   for(const caption of full.figures.slice(0,5))details.append(elt('p',caption));
  }
  card.append(details);
  const decision=report.decisions[r.doi],line=elt('p',decision?`${decision.decision} · ${decision.by}`:'No decision');line.className='review-decision';card.append(line);
  if(report.canReview){
   const buttons=elt('div','');buttons.className='decision-buttons';
   for(const [value,label] of [['approved','Approve for consideration'],['excluded','Exclude'],['pending','Reset']]){
    const button=elt('button',label);button.type='button';button.className='secondary';button.disabled=value==='approved'&&full.status!=='readable';
    button.onclick=async()=>{
     for(const b of buttons.querySelectorAll('button'))b.disabled=true;
     try{const response=await fetch(API+'/preprint-screening/decision',{method:'PUT',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({doi:r.doi,decision:value})});
      const result=await response.json();if(!response.ok)throw Error(result.error||'Could not save');report.decisions=result.decisions;render();
     }catch(error){line.textContent=error.message;for(const b of buttons.querySelectorAll('button'))b.disabled=false}
    };buttons.append(button);
   }card.append(buttons);
  }
  list.append(card);
 }
}

onAuthChange(()=>load());
if(currentUser())load();
