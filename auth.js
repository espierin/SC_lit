import {cachedIdentity,withIdentity,IDENTITY_FRESH_MS} from './session-view.mjs?v=banner25';
import {applyAccess} from './access.js?v=banner25';
const AUTH_API='https://efi-journal-club-review-store.espierin.chatgpt.site';
let session=null,user=null,authListeners=[],activation=null,adminState=null,linkedinState=null,adminEmail=null,deleteTarget=null,authInitialized=false,connectionWarning=false;
try{session=JSON.parse(sessionStorage.getItem('efi-session')||'null');if(session?.expiresAt<Date.now())session=null}catch{}
user=cachedIdentity(session);
export const currentUser=()=>user;
export const authHeaders=()=>session?.token?{Authorization:'Bearer '+session.token}:{};
export const onAuthChange=fn=>authListeners.push(fn);
const el=id=>document.getElementById(id);
const make=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
function notify(){for(const listener of authListeners)listener(user)}
function forget(){session=user=null;sessionStorage.removeItem('efi-session');renderAuth();notify()}
export function expireLogin(){if(session)forget()}
async function authRequest(path,body){
 const r=await fetch(AUTH_API+path,{cache:'no-store',method:body?'POST':'GET',headers:{...authHeaders(),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();if(!r.ok){if(r.status===401&&session)forget();const error=Error(data.error||'Authentication service unavailable');error.status=r.status;throw error}return data;
}
function renderAuth(){
 applyAccess(user);for(const link of document.querySelectorAll('[data-announcement-nav]'))link.hidden=user?.canAnnouncement!==true;for(const link of document.querySelectorAll('[data-admin-nav]'))link.hidden=user?.role!=='admin';
 const signed=!!user;const adminPage=document.body.dataset.page==='admin';
 el('login-open').hidden=signed;el('account-name').hidden=!signed;
 const firstName=name=>String(name||'').trim().split(/\s+/)[0]||'Unassigned';
 el('banner-first-name').textContent=signed?firstName(user.name):'';
 el('banner-duty').textContent=signed?'Duty in week '+user.week+': '+firstName(user.onDuty):'';
 el('account-name').setAttribute('aria-label',signed?firstName(user.name)+', account options. Duty in week '+user.week+': '+firstName(user.onDuty):'Account options');
 if(!signed){el('account-menu').hidden=true;el('account-name').setAttribute('aria-expanded','false');}
 if(el('review-workspace'))el('review-workspace').hidden=!signed;
 if(adminPage){const allowed=user?.role==='admin';if(!allowed&&el('member-delete-dialog')?.open)el('member-delete-dialog').close();if(el('admin-panel'))el('admin-panel').hidden=!allowed;if(el('automation-panel'))el('automation-panel').hidden=!allowed;if(el('admin-access'))el('admin-access').textContent=allowed?'Administrator access confirmed.':signed?'This account can review articles but cannot manage administration. Use the reviewer desk.':'Sign in with your administrator account to manage the Journal Club.';}
}
async function refreshUser(){if(!session){renderAuth();return}try{user=await authRequest('/auth/me');session=withIdentity(session,user);try{sessionStorage.setItem('efi-session',JSON.stringify(session))}catch{};if(connectionWarning){el('login-message').textContent='';connectionWarning=false;}renderAuth();notify()}catch(e){if(!session||e.status===401){if(session)forget();el('login-message').textContent='Your session has ended. Sign in again to continue.';}else{connectionWarning=true;if(!user)renderAuth();el('login-message').textContent='The connection is temporarily unavailable. Your session and local edits are retained. The connection will be checked again automatically.';}}}
function invitation(result,person){
 if(!result.activationUrl)return;const box=el('admin-invitation');box.replaceChildren(make('p','Activation link for '+person.name+' (valid for 7 days). Share this link privately with that person.'));
 const input=make('input');input.type='text';input.readOnly=true;input.value=result.activationUrl;input.setAttribute('aria-label','Private activation link');const copy=make('button','Copy activation link');copy.type='button';copy.onclick=async()=>{await navigator.clipboard.writeText(result.activationUrl);el('admin-message').textContent='Private activation link copied.'};box.append(input,copy);
 if(person.email===user?.email){const open=make('a','Open password setup');open.href=result.activationUrl;open.className='button secondary';box.append(open);}
}
async function personAction(person,action){
 try{el('admin-message').textContent='Saving account…';const result=await authRequest('/auth/admin/person',{email:person.email,action});el('admin-message').textContent=action==='deactivate'?'Account deactivated. Existing sessions no longer have access.':'Account updated.';invitation(result,person);await loadAdmin();}catch(e){el('admin-message').textContent=e.message}
}
async function addMember(event){
 event.preventDefault();const b=el('member-add');b.disabled=true;
 try{const result=await authRequest('/auth/admin/member',{action:'add',name:el('member-name').value.trim(),email:el('member-email').value.trim(),rosterRevision:adminState.rosterRevision});el('member-message').textContent=result.message;el('member-add-form').reset();await loadAdmin()}catch(e){el('member-message').textContent=e.message}finally{b.disabled=false}
}
function openDeleteMember(person){deleteTarget=person;el('member-delete-person').textContent=person.name+' · '+person.email;el('member-delete-email').value='';el('member-delete-error').textContent='';el('member-delete-confirm').disabled=true;el('member-delete-dialog').showModal();el('member-delete-email').focus()}
async function deleteMember(event){
 event.preventDefault();if(!deleteTarget||el('member-delete-email').value!==deleteTarget.email)return;const b=el('member-delete-confirm');b.disabled=true;
 try{const result=await authRequest('/auth/admin/member',{action:'delete',email:deleteTarget.email,confirmEmail:el('member-delete-email').value,rosterRevision:adminState.rosterRevision});el('member-delete-dialog').close();deleteTarget=null;el('admin-invitation').replaceChildren();el('member-message').textContent=result.message;await loadAdmin()}catch(e){el('member-delete-error').textContent=e.message}finally{b.disabled=!deleteTarget||el('member-delete-email').value!==deleteTarget.email}
}
function renderAdmin(){
 const people=el('admin-people');people.replaceChildren();
 for(const person of adminState.people){const card=make('div');card.className='person-card';card.append(make('strong',person.name),make('p',person.email),make('p',(person.active?'Active':'Inactive')+(person.hasPassword?' · password set':' · password not set')+(person.role==='admin'?' · administrator':person.role==='backup'?' · year-round reviewer':'')));
  const profile=linkedinState?.profiles?.[person.email]||{status:'confirmation_required'};card.append(make('p','LinkedIn: '+profile.status.replaceAll('_',' ')+' · clickable mention not tested'));
  if(profile.candidateUrl){const hint=make('a','Inspect unconfirmed candidate profile');hint.href=profile.candidateUrl;hint.target='_blank';hint.rel='noopener';card.append(hint)}
  const profileLabel=make('label','Confirmed LinkedIn profile URL');const profileInput=make('input');profileInput.type='url';profileInput.value=profile.url||'';profileInput.placeholder='https://www.linkedin.com/in/...';profileLabel.append(profileInput);card.append(profileLabel);
  const confirmLabel=make('label','I confirm this profile belongs to this SC member');const confirmInput=make('input');confirmInput.type='checkbox';confirmInput.style.width='auto';confirmLabel.prepend(confirmInput);card.append(confirmLabel);
  const profileSave=make('button','Save LinkedIn profile');profileSave.type='button';profileSave.className='secondary';profileSave.onclick=async()=>{try{await authRequest('/auth/admin/linkedin',{email:person.email,url:profileInput.value,confirmed:confirmInput.checked,revision:linkedinState.revision});el('admin-message').textContent='Profile saved. Clickable mentioning still requires a Buffer check.';await loadAdmin()}catch(error){el('admin-message').textContent=error.message}};card.append(profileSave);
  const buttons=make('div');buttons.className='account-actions';
  const add=(label,action)=>{const b=make('button',label);b.type='button';b.className='secondary';b.dataset.help=action==='deactivate'?'Immediately revoke this member’s access, including existing sessions.':action==='reset'?'Create a private, one-use password reset link valid for seven days. The previous link and sessions are revoked.':'Activate this account. New users receive a private, one-use setup link; existing passwords are retained.';b.onclick=()=>personAction(person,action);buttons.append(b)};
  if(person.role!=='admin')add(person.active?'Deactivate':'Activate',person.active?'deactivate':'activate');
  add(person.hasPassword?'Create password reset link':'Create activation link',person.hasPassword?'reset':'activate');if(person.role!=='admin'){const remove=make('button','Permanently remove');remove.type='button';remove.className='danger';remove.dataset.help='Delete this member’s account and revoke access. Assigned duty blocks become unassigned. Earlier reviews remain. You must type the email address to confirm.';remove.onclick=()=>openDeleteMember(person);buttons.append(remove)}card.append(buttons);people.append(card);
 }
 const body=el('duty-rows');body.replaceChildren();
 for(const block of adminState.schedule.blocks){const tr=make('tr'),period=make('td','Weeks '+block.startWeek+' - '+block.endWeek),choice=make('select');choice.setAttribute('aria-label','Duty reviewer for weeks '+block.startWeek+' to '+block.endWeek);
  choice.append(new Option('Unassigned  -  choose a reviewer',''));for(const p of adminState.people)choice.append(new Option(p.name+(p.active?'':' (inactive)'),p.email));choice.value=block.email;choice.dataset.block=block.id;choice.dataset.help='Assign a reviewer to this four-week ISO-week block. Inactive accounts must be activated before they can sign in. Save the roster to apply changes.';
  if(adminState.schedule.year===user?.year&&user.week>=block.startWeek&&user.week<=block.endWeek){tr.className='current-duty';period.append(make('strong',' · Current duty'));}
  const cell=make('td');cell.append(choice);tr.append(period,cell);body.append(tr);
 }
 el('admin-year-note').textContent='ISO week numbers · '+adminState.schedule.year+'. Each assignment covers four weeks; the final block may be shorter. Inactive reviewers cannot sign in or receive reviewer reminders; activate them before their duty. Pietro and the administrator always retain review access.';
}
async function loadAdmin(){const year=el('duty-year').value;adminState=await authRequest('/auth/admin?year='+year);linkedinState=await authRequest('/auth/admin/linkedin');renderAdmin()}
function bindAdminControls(){
 if(el('duty-year')&&!el('duty-year').dataset.bound){
 el('duty-year').dataset.bound='true';
 el('member-add-form').onsubmit=addMember;el('member-delete-form').onsubmit=deleteMember;el('member-delete-cancel').onclick=()=>el('member-delete-dialog').close();el('member-delete-dialog').addEventListener('close',()=>{deleteTarget=null});el('member-delete-email').oninput=()=>{el('member-delete-confirm').disabled=!deleteTarget||el('member-delete-email').value!==deleteTarget.email};
 el('duty-year').value=String(new Date().getFullYear());el('duty-year').onchange=async()=>{try{await loadAdmin()}catch(e){el('admin-message').textContent=e.message}};
 el('duty-save').onclick=async()=>{const b=el('duty-save');b.disabled=true;try{const blocks=adminState.schedule.blocks.map(block=>({...block,email:el('duty-rows').querySelector('[data-block="'+block.id+'"]').value}));adminState.schedule=await authRequest('/auth/admin/schedule',{year:adminState.schedule.year,revision:adminState.schedule.revision,blocks});el('admin-message').textContent='Duty roster saved. Access restrictions apply immediately.';await refreshUser();}catch(e){el('admin-message').textContent=e.message}finally{b.disabled=false}};
 if(document.body.dataset.page==='admin')onAuthChange(async u=>{if(u?.role!=='admin'){adminEmail=null;return}if(adminEmail===u.email)return;adminEmail=u.email;try{await loadAdmin()}catch(e){el('admin-message').textContent=e.message}});

 if(user?.role==='admin'){adminEmail=user.email;loadAdmin().catch(e=>{el('admin-message').textContent=e.message});}
 }
}
export async function initAuth(){
 if(authInitialized){bindAdminControls();renderAuth();return user}authInitialized=true;
 const params=new URLSearchParams(location.hash.slice(1));if(params.has('activate')){
  activation={token:params.get('activate'),email:params.get('email')||''};history.replaceState(null,'',location.pathname+location.search);el('login-dialog').showModal();el('login-email').value=activation.email;el('login-email').readOnly=true;el('login-password').autocomplete='new-password';el('password-confirm-label').hidden=false;el('login-submit').textContent='Set my password';el('login-heading').textContent='Activate your account';el('login-message').textContent='Choose a password of at least 12 characters. Your password is never stored in GitHub.';
 }
 el('login-open').onclick=()=>{el('login-dialog').showModal();el('login-email').focus()};
 el('login-close').onclick=()=>el('login-dialog').close();
 const closeAccount=()=>{el('account-menu').hidden=true;el('account-name').setAttribute('aria-expanded','false')};
 el('account-name').onclick=()=>{const open=el('account-menu').hidden;el('account-menu').hidden=!open;el('account-name').setAttribute('aria-expanded',String(open));if(open)el('logout').focus()};
 document.addEventListener('click',event=>{if(!event.target.closest('.banner-account'))closeAccount()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el('account-menu').hidden){closeAccount();el('account-name').focus()}});
 document.addEventListener('focusin',event=>{if(!event.target.closest('.banner-account'))closeAccount()});

 el('login-form').onsubmit=async event=>{event.preventDefault();const b=el('login-submit');b.disabled=true;try{
  const email=el('login-email').value.trim(),password=el('login-password').value;
  if(activation){if(password!==el('login-confirm').value)throw Error('The passwords do not match.');const result=await authRequest('/auth/activate',{email,password,token:activation.token});activation=null;el('password-confirm-label').hidden=true;el('login-email').readOnly=false;el('login-password').autocomplete='current-password';el('login-submit').textContent='Sign in';el('login-heading').textContent='Sign in';el('login-message').textContent=result.message;el('login-password').value=el('login-confirm').value='';}
  else{session=await authRequest('/auth/login',{email,password});sessionStorage.setItem('efi-session',JSON.stringify(session));el('login-password').value='';el('login-message').textContent='';el('login-dialog').close();await refreshUser();}
 }catch(e){el('login-message').textContent=e.message}finally{b.disabled=false}};
 el('logout').onclick=async()=>{try{await authRequest('/auth/logout',{})}finally{forget();el('login-dialog').close()}};
 bindAdminControls();
 if(!user)await refreshUser();renderAuth();const wait=Math.max(0,IDENTITY_FRESH_MS-(Date.now()-(session?.profileCheckedAt||0)));setTimeout(()=>{refreshUser();setInterval(refreshUser,IDENTITY_FRESH_MS)},wait);return user;
}
