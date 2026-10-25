import {applyAccess} from './access.js?v=hold7';
const AUTH_API='https://efi-journal-club-review-store.espierin.chatgpt.site';
let session=null,user=null,authListeners=[],activation=null,adminState=null,adminEmail=null,deleteTarget=null,authInitialized=false;
try{session=JSON.parse(sessionStorage.getItem('efi-session')||'null');if(session?.expiresAt<Date.now())session=null}catch{}
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
 const data=await r.json();if(!r.ok){if(r.status===401&&session)forget();throw Error(data.error||'Authentication service unavailable')}return data;
}
function renderAuth(){
 applyAccess(user);
 const signed=!!user;const adminPage=document.body.dataset.page==='admin';el('login-open').hidden=signed;el('logout').hidden=!signed;el('admin-open').hidden=user?.role!=='admin';
 el('account-status').textContent=signed?user.name+' · '+(user.role==='admin'?'Administrator':user.role==='backup'?'Pietro · year-round reviewer':'Duty reviewer')+' · Week '+user.week+' · On duty: '+user.onDuty:'Sign in to review articles and approve publication.';
 if(el('review-workspace'))el('review-workspace').hidden=!signed;
 if(adminPage){const allowed=user?.role==='admin';if(!allowed&&el('member-delete-dialog')?.open)el('member-delete-dialog').close();if(el('admin-panel'))el('admin-panel').hidden=!allowed;if(el('automation-panel'))el('automation-panel').hidden=!allowed;if(el('admin-access'))el('admin-access').textContent=allowed?'Administrator access confirmed.':signed?'This account can review articles but cannot manage administration. Use the reviewer desk.':'Sign in with your administrator account to manage the Journal Club.';}
}
async function refreshUser(){if(!session){renderAuth();return}try{user=await authRequest('/auth/me');renderAuth();notify()}catch(e){forget();el('login-message').textContent=e.message}}
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
  const buttons=make('div');buttons.className='account-actions';
  const add=(label,action)=>{const b=make('button',label);b.type='button';b.className='secondary';b.dataset.help=action==='deactivate'?'Immediately revoke this member’s access, including existing sessions.':action==='reset'?'Create a private, one-use password reset link valid for seven days. The previous link and sessions are revoked.':'Activate this account. New users receive a private, one-use setup link; existing passwords are retained.';b.onclick=()=>personAction(person,action);buttons.append(b)};
  if(person.role!=='admin')add(person.active?'Deactivate':'Activate',person.active?'deactivate':'activate');
  add(person.hasPassword?'Create password reset link':'Create activation link',person.hasPassword?'reset':'activate');if(person.role!=='admin'){const remove=make('button','Permanently remove');remove.type='button';remove.className='danger';remove.dataset.help='Delete this member’s account and revoke access. Assigned duty blocks become unassigned. Earlier reviews remain. You must type the email address to confirm.';remove.onclick=()=>openDeleteMember(person);buttons.append(remove)}card.append(buttons);people.append(card);
 }
 const body=el('duty-rows');body.replaceChildren();
 for(const block of adminState.schedule.blocks){const tr=make('tr'),period=make('td','Weeks '+block.startWeek+'–'+block.endWeek),choice=make('select');choice.setAttribute('aria-label','Duty reviewer for weeks '+block.startWeek+' to '+block.endWeek);
  choice.append(new Option('Unassigned — choose a reviewer',''));for(const p of adminState.people)choice.append(new Option(p.name+(p.active?'':' (inactive)'),p.email));choice.value=block.email;choice.dataset.block=block.id;choice.dataset.help='Assign a reviewer to this four-week ISO-week block. Inactive accounts must be activated before they can sign in. Save the roster to apply changes.';
  const cell=make('td');cell.append(choice);tr.append(period,cell);body.append(tr);
 }
 el('admin-year-note').textContent='ISO week numbers · '+adminState.schedule.year+'. Each assignment covers four weeks; the final block may be shorter. Pietro and the administrator always retain review access.';
}
async function loadAdmin(){const year=el('duty-year').value;adminState=await authRequest('/auth/admin?year='+year);renderAdmin()}
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
  activation={token:params.get('activate'),email:params.get('email')||''};history.replaceState(null,'',location.pathname+location.search);el('login-form').hidden=false;el('login-email').value=activation.email;el('login-email').readOnly=true;el('login-password').autocomplete='new-password';el('password-confirm-label').hidden=false;el('login-submit').textContent='Set my password';el('login-heading').textContent='Activate your account';el('login-message').textContent='Choose a password of at least 12 characters. Your password is never stored in GitHub.';
 }
 el('login-open').onclick=()=>{el('login-form').hidden=!el('login-form').hidden;if(!el('login-form').hidden)el('login-email').focus()};
 el('login-form').onsubmit=async event=>{event.preventDefault();const b=el('login-submit');b.disabled=true;try{
  const email=el('login-email').value.trim(),password=el('login-password').value;
  if(activation){if(password!==el('login-confirm').value)throw Error('The passwords do not match.');const result=await authRequest('/auth/activate',{email,password,token:activation.token});activation=null;el('password-confirm-label').hidden=true;el('login-email').readOnly=false;el('login-password').autocomplete='current-password';el('login-submit').textContent='Sign in';el('login-heading').textContent='Sign in';el('login-message').textContent=result.message;el('login-password').value=el('login-confirm').value='';}
  else{session=await authRequest('/auth/login',{email,password});sessionStorage.setItem('efi-session',JSON.stringify(session));el('login-password').value='';el('login-message').textContent='';el('login-form').hidden=true;await refreshUser();}
 }catch(e){el('login-message').textContent=e.message}finally{b.disabled=false}};
 el('logout').onclick=async()=>{try{await authRequest('/auth/logout',{})}finally{forget();el('login-form').hidden=true}};
 bindAdminControls();
 await refreshUser();setInterval(refreshUser,60000);renderAuth();return user;
}
