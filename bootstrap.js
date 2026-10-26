import {applyAccess} from './access.js?v=hold7';
import {initAuth,currentUser,authHeaders,onAuthChange} from './auth.js?v=hold7';
const API='https://efi-journal-club-review-store.espierin.chatgpt.site';
const file=location.pathname.split('/').pop()||'index.html',page={'index.html':'review','admin.html':'admin','help.html':'help','announcement.html':'announcement'}[file];
let loaded=false,loading=false;
async function openPage(user){
 if(!user){if(loaded){document.getElementById('protected-content').replaceChildren();location.reload()}return}
 if(loaded||loading||!page||page==='admin'&&user.role!=='admin')return;loading=true;
 try{const r=await fetch(API+'/pages/'+page,{cache:'no-store',headers:authHeaders()});if(!r.ok)throw Error(r.status===403?'Administrator access is required.':'Sign in again to load this page.');const data=await r.json();if(!currentUser())return;document.getElementById('protected-content').innerHTML=data.html;loaded=true;applyAccess(currentUser());
  if(page==='review'){await import('./app.js?v=hold8');await import('./preprints.js?v=hold8')}
  else if(page==='admin')await import('./admin.js?v=hold7');
  else if(page==='announcement')await import('./announcement.js?v=hold7');
  for(const name of new Set([...document.querySelectorAll('[data-private-asset]')].map(n=>n.dataset.privateAsset))){const asset=await fetch(API+'/protected-assets/'+name,{headers:authHeaders(),cache:'no-store'});if(!asset.ok)throw Error('Could not load workflow downloads.');const objectUrl=URL.createObjectURL(await asset.blob());for(const element of document.querySelectorAll('[data-private-asset]'))if(element.dataset.privateAsset===name){if(element.tagName==='IMG')element.src=objectUrl;else element.href=objectUrl;}}
  const print=document.getElementById('print-workflow');if(print)print.addEventListener('click',()=>window.print());
 }catch(e){const notice=document.getElementById('access-notice');notice.hidden=false;notice.textContent='Could not open this page: '+e.message;}finally{loading=false}
}
onAuthChange(openPage);await initAuth();await openPage(currentUser());
