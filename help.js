const help={
'announcement-date':'Choose a future date for the separate announcement.',
'announcement-time':'Publication time in Europe/Amsterdam, CET in winter and CEST in summer.',
'announcement-confirm':'Approve the displayed announcement text and banner for this date and time.',
'announcement-schedule':'Schedule or reschedule the announcement and verify it in Buffer. The newsletter is unaffected.',
'member-name':'The name displayed on the member list, duty roster and future reviews.',
'member-email':'The member’s sign-in email address. Addresses are stored privately and must be unique.',
'member-add':'Add an inactive reviewer. Create an activation link afterwards; no email is sent automatically.',
'member-delete-email':'Type the exact email address shown above to enable permanent removal.',
'member-delete-confirm':'Permanently remove the account. Access and activation links are revoked; assigned duties become unassigned. Review history is retained.',
'login-open':'Open the sign-in form. Only activated, allowlisted accounts can sign in.',
'login-email':'Use the email address for which Eric issued your activation link.',
'login-password':'Enter your password. During activation choose at least 12 characters.',
'login-confirm':'Repeat your new password exactly.',
'login-submit':'All activated members can inspect. Weekly decisions require the duty reviewer, Eric or Pietro.',
'logout':'End your session on this browser tab.',
'edition':'Choose the weekly edition to review. Finish saving your changes before switching.',
'reload':'Load the latest centrally saved review. Unsaved edits are backed up locally but are replaced on screen.',
'retry':'Retry saving your current changes to central storage. Resolve conflicts by reloading first.',
'copy':'Copy the fully reviewed LinkedIn text. Copying does not create another post.',
'download':'Save the reviewed LinkedIn post as a plain text file. This does not publish it.',
'linkedin':'Copy the text and open the EFI page for manual posting. Check Buffer first to avoid publishing twice.',
'history':'Select a previous saved review. Restoring it creates a new revision.',
'restore':'Restore the selected earlier version and save it centrally as a new revision. This can affect the scheduled post.',
'import':'Import a previous review from this browser only when no central decisions exist.',
'duty-year':'Choose the ISO calendar year whose four-week review duties you want to manage.',
'duty-save':'Apply all reviewer assignments shown for this year. Access changes on the next authenticated request.',
'query-day':'Save a desired search weekday. Also apply this timing in the ChatGPT cloud task; this field cannot change its trigger.',
'query-time':'Preparation start in CET/CEST, 24-hour clock. Friday 04:00 targets readiness by 07:00. Update the actual ChatGPT trigger separately.',
'query-paused':'The cloud task checks this flag before research and before writing a new edition. It wakes at its existing time but skips the work while paused.',
'posting-day':'Schedule approved edition posts on this weekday following the edition date. Late approvals are submitted immediately.',
'posting-time':'Publication time in Amsterdam, 24-hour clock. Summer and winter time are handled automatically.',
'posting-paused':'Return unsent scheduled edition posts to Buffer drafts and stop new automatic submissions. Check the synchronization result; failures require attention.',
'automation-save':'Save both schedules and pause flags. Unsent edition posts are synchronized with Buffer; search timing needs a separate ChatGPT schedule change.',
'automation-retry':'Retry applying the saved publication settings to Buffer. Check warnings first; uncertain posts are held to prevent duplicates.',
'print-workflow':'Open your browser print dialog. Choose Save as PDF to share the workflow.'
};
let serial=0;
function decorate(){for(const [id,text] of Object.entries(help)){const n=document.getElementById(id);if(n)n.dataset.help=text}
for(const n of document.querySelectorAll('[data-help]:not([data-help-ready])')){n.dataset.helpReady='true';if(['INPUT','SELECT','TEXTAREA'].includes(n.tagName)&&!n.hasAttribute('aria-label')){const label=n.labels?.[0];const words=label?[...label.childNodes].filter(child=>child.nodeType===3).map(child=>child.textContent.trim()).filter(Boolean).join(' '):'';if(words)n.setAttribute('aria-label',words)}const hint=document.createElement('button');hint.type='button';hint.className='help-hint';hint.setAttribute('aria-label','Help: '+(n.getAttribute('aria-label')||n.textContent?.trim()||n.id||'this control'));hint.setAttribute('aria-expanded','false');hint.textContent='?';const tip=document.createElement('span');tip.className='help-tooltip';tip.id='help-tip-'+(++serial);tip.role='tooltip';tip.textContent=n.dataset.help;hint.setAttribute('aria-describedby',tip.id);hint.append(tip);hint.addEventListener('focus',()=>{delete hint.dataset.tooltipDismissed});hint.addEventListener('mouseenter',()=>{delete hint.dataset.tooltipDismissed});hint.addEventListener('click',()=>{delete hint.dataset.tooltipDismissed;hint.setAttribute('aria-expanded',hint.getAttribute('aria-expanded')==='true'?'false':'true')});hint.addEventListener('keydown',e=>{if(e.key==='Escape'){hint.setAttribute('aria-expanded','false');hint.dataset.tooltipDismissed='true'}});n.setAttribute('aria-describedby',[n.getAttribute('aria-describedby'),tip.id].filter(Boolean).join(' '));
if(n.tagName==='BUTTON'){const wrap=document.createElement('div');wrap.className='control-help';n.before(wrap);wrap.append(n,hint)}else n.after(hint);
}}
decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});

// Keep the current page and keyboard focus visible without moving the page vertically.
const menu=document.querySelector('.site-nav');
if(menu){const reveal=node=>{if(!node||node.hidden)return;const box=menu.getBoundingClientRect(),item=node.getBoundingClientRect();if(item.right>box.right-6)menu.scrollLeft+=item.right-box.right+6;else if(item.left<box.left+6)menu.scrollLeft-=box.left-item.left+6;};const current=()=>reveal(menu.querySelector('[aria-current="page"]'));menu.addEventListener('focusin',event=>reveal(event.target.closest('a')));new ResizeObserver(current).observe(menu);new MutationObserver(current).observe(menu,{attributes:true,subtree:true,attributeFilter:['hidden','aria-current']});requestAnimationFrame(current);}
