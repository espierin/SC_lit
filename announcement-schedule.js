import {currentUser,authHeaders,onAuthChange} from './auth.js?v=banner30';
let saved;
const el=id=>document.getElementById(id);
async function request(body){
 const r=await fetch('https://efi-journal-club-review-store.espierin.chatgpt.site/announcement-schedule',{method:body?'POST':'GET',cache:'no-store',headers:{...authHeaders(),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const result=await r.json();if(!r.ok)throw Error(result.error||'Announcement scheduling unavailable.');return result;
}
async function setup(user){
 const panel=el('announcement-scheduling');if(!panel)return;panel.hidden=user?.canAnnouncement!==true;if(panel.hidden||panel.dataset.ready)return;panel.dataset.ready='true';
 const status=el('announcement-schedule-status');
 try{
  saved=await request();const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const tomorrow=new Date(today+'T12:00:00Z');tomorrow.setUTCDate(tomorrow.getUTCDate()+1);
  el('announcement-date').value=saved.date||tomorrow.toISOString().slice(0,10);el('announcement-time').value=saved.time||'06:00';
  const archive=await fetch('https://efi-journal-club-review-store.espierin.chatgpt.site/archive',{cache:'no-store'});if(archive.ok&&(await archive.json()).posts?.some(post=>post.key==='announcement')){status.textContent='This announcement has already been published. You can find it in the year archive. Scheduling it again is not available.';el('announcement-schedule-form').hidden=true;el('announcement-linkedin').disabled=true;return;}
  status.textContent=saved.status==='scheduled'?'Scheduled with banner for '+saved.date+' at '+saved.time+' CET/CEST. Check Buffer for delivery.':'Current status: '+saved.status+'. Choose a future date and time.';
  el('announcement-schedule-form').addEventListener('submit',async event=>{
   event.preventDefault();el('announcement-schedule').disabled=true;
   try{status.textContent='Scheduling and verifying the announcement and banner in Buffer...';saved=await request({revision:saved.revision,date:el('announcement-date').value,time:el('announcement-time').value,confirm:el('announcement-confirm').checked});status.textContent='Verified in Buffer: scheduled with banner for '+saved.date+' at '+saved.time+' CET/CEST.';el('announcement-confirm').checked=false;}
   catch(error){status.textContent=error.message;}finally{el('announcement-schedule').disabled=false;}
  });
 }catch(error){status.textContent=error.message;delete panel.dataset.ready;}
}
onAuthChange(setup);await setup(currentUser());
