import {applyAccess} from './access.js?v=banner28';
import {initAuth,currentUser,authHeaders,onAuthChange,expireLogin} from './auth.js?v=banner28';
const API='https://efi-journal-club-review-store.espierin.chatgpt.site';
const file=location.pathname.split('/').pop()||'index.html',page={'index.html':'review','admin.html':'admin','help.html':'help','announcement.html':'announcement','newsletter.html':'newsletter'}[file];
let loaded=false,loading=false;
async function openPage(user){
 if(!user){if(loaded){location.reload()}return}
 if(loaded||loading||!page||page==='announcement'&&user.canAnnouncement!==true||page==='admin'&&user.role!=='admin'||page==='newsletter'&&!user.canNewsletter)return;loading=true;
 try{const r=await fetch(API+'/pages/'+page,{cache:'no-store',headers:authHeaders()});if(r.status===401){expireLogin();return}if(!r.ok)throw Error(r.status===403?'Access to this page is restricted for your account.':'Sign in again to load this page.');const data=await r.json();if(!currentUser())return;document.getElementById('protected-content').innerHTML=data.html;applyAccess(currentUser());
  if(page==='review')await import('./app.js?v=banner28');
  else if(page==='admin')await import('./admin.js?v=banner28');
  else if(page==='announcement')await import('./announcement.js?v=banner28');
  else if(page==='newsletter')await import('./newsletter.js?v=banner28');
  loaded=true;
  for(const name of new Set([...document.querySelectorAll('[data-private-asset]')].map(n=>n.dataset.privateAsset))){const asset=await fetch(API+'/protected-assets/'+name,{headers:authHeaders(),cache:'no-store'});if(!asset.ok)throw Error('Could not load workflow downloads.');const objectUrl=URL.createObjectURL(await asset.blob());for(const element of document.querySelectorAll('[data-private-asset]'))if(element.dataset.privateAsset===name){if(element.tagName==='IMG')element.src=objectUrl;else element.href=objectUrl;}}
  const print=document.getElementById('print-workflow');if(print)print.addEventListener('click',()=>window.print());
 }catch(e){const notice=document.getElementById('access-notice');notice.hidden=false;notice.replaceChildren(document.createTextNode('This page could not be opened. Your saved work has not changed. '+e.message));const retry=document.createElement('button');retry.type='button';retry.className='secondary';retry.textContent='Reload this page';retry.addEventListener('click',()=>location.reload());notice.append(retry);}finally{loading=false}
}
onAuthChange(openPage);await initAuth();await openPage(currentUser());
