// Reserve contextual help for controls with non-obvious consequences.
const help={
 'query-time':'This saves the desired preparation time. The actual ChatGPT trigger must be updated separately; this field cannot reschedule it.',
 'posting-paused':'Pause automatic LinkedIn publication and return unsent posts to Buffer drafts. Check synchronization: an unresolved Buffer error can leave a post queued.',
 'import':'Recover an earlier review from this browser only. This is available only before central decisions exist; recovered articles return to pending.'
};
let serial=0;
function decorate(){for(const [id,text] of Object.entries(help)){const n=document.getElementById(id);if(n)n.dataset.help=text}
for(const n of document.querySelectorAll('[data-help]:not([data-help-ready])')){n.dataset.helpReady='true';if(['INPUT','SELECT','TEXTAREA'].includes(n.tagName)&&!n.hasAttribute('aria-label')){const label=n.labels?.[0];const words=label?[...label.childNodes].filter(child=>child.nodeType===3).map(child=>child.textContent.trim()).filter(Boolean).join(' '):'';if(words)n.setAttribute('aria-label',words)}if(!Object.hasOwn(help,n.id))continue;const hint=document.createElement('button');hint.type='button';hint.className='help-hint';hint.setAttribute('aria-label','Help: '+(n.getAttribute('aria-label')||n.textContent?.trim()||n.id||'this control'));hint.setAttribute('aria-expanded','false');hint.textContent='?';const tip=document.createElement('span');tip.className='help-tooltip';tip.id='help-tip-'+(++serial);tip.role='tooltip';tip.textContent=n.dataset.help;hint.setAttribute('aria-describedby',tip.id);hint.append(tip);hint.addEventListener('focus',()=>{delete hint.dataset.tooltipDismissed});hint.addEventListener('mouseenter',()=>{delete hint.dataset.tooltipDismissed});hint.addEventListener('click',()=>{delete hint.dataset.tooltipDismissed;hint.setAttribute('aria-expanded',hint.getAttribute('aria-expanded')==='true'?'false':'true')});hint.addEventListener('keydown',e=>{if(e.key==='Escape'){hint.setAttribute('aria-expanded','false');hint.dataset.tooltipDismissed='true'}});n.setAttribute('aria-describedby',[n.getAttribute('aria-describedby'),tip.id].filter(Boolean).join(' '));
if(n.tagName==='BUTTON'){const wrap=document.createElement('div');wrap.className='control-help';n.before(wrap);wrap.append(n,hint)}else n.after(hint);
}}
decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});

// Keep the current page and keyboard focus visible without moving the page vertically.
const menu=document.querySelector('.site-nav');
if(menu){const reveal=node=>{if(!node||node.hidden)return;const box=menu.getBoundingClientRect(),item=node.getBoundingClientRect();if(item.right>box.right-6)menu.scrollLeft+=item.right-box.right+6;else if(item.left<box.left+6)menu.scrollLeft-=box.left-item.left+6;};const current=()=>reveal(menu.querySelector('[aria-current="page"]'));menu.addEventListener('focusin',event=>reveal(event.target.closest('a')));new ResizeObserver(current).observe(menu);new MutationObserver(current).observe(menu,{attributes:true,subtree:true,attributeFilter:['hidden','aria-current']});requestAnimationFrame(current);}
