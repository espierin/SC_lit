// Reserve contextual help for controls with non-obvious consequences.
const help={
 'query-time':'This saves the desired preparation time. The actual ChatGPT trigger must be updated separately; this field cannot reschedule it.',
 'posting-paused':'Pause automatic LinkedIn publication and return unsent posts to Buffer drafts. Check synchronization: an unresolved Buffer error can leave a post queued.',
 'import':'Recover an earlier review from this browser only. This is available only before central decisions exist; recovered articles return to pending.'
};
let serial=0;
function decorate(){
// Version internal page links together, including links inserted after sign-in.
for(const link of document.querySelectorAll('a[href]')){const raw=link.getAttribute('href');if(raw.startsWith('#'))continue;const url=new URL(raw,location.href);if(url.origin!==location.origin||!/(?:^|\/)(?:index|admin|history|announcement|help|newsletter)\.html$/.test(url.pathname))continue;if(url.searchParams.get('ui')!=='banner28'){url.searchParams.set('ui','banner28');link.href=url.pathname+url.search+url.hash;}}
for(const [id,text] of Object.entries(help)){const n=document.getElementById(id);if(n)n.dataset.help=text}
for(const n of document.querySelectorAll('[data-help]:not([data-help-ready])')){n.dataset.helpReady='true';if(['INPUT','SELECT','TEXTAREA'].includes(n.tagName)&&!n.hasAttribute('aria-label')){const label=n.labels?.[0];const words=label?[...label.childNodes].filter(child=>child.nodeType===3).map(child=>child.textContent.trim()).filter(Boolean).join(' '):'';if(words)n.setAttribute('aria-label',words)}if(!Object.hasOwn(help,n.id))continue;const hint=document.createElement('button');hint.type='button';hint.className='help-hint';hint.setAttribute('aria-label','Help: '+(n.getAttribute('aria-label')||n.textContent?.trim()||n.id||'this control'));hint.setAttribute('aria-expanded','false');hint.textContent='?';const tip=document.createElement('span');tip.className='help-tooltip';tip.id='help-tip-'+(++serial);tip.role='tooltip';tip.textContent=n.dataset.help;hint.setAttribute('aria-describedby',tip.id);hint.append(tip);hint.addEventListener('focus',()=>{delete hint.dataset.tooltipDismissed});hint.addEventListener('mouseenter',()=>{delete hint.dataset.tooltipDismissed});hint.addEventListener('click',()=>{delete hint.dataset.tooltipDismissed;hint.setAttribute('aria-expanded',hint.getAttribute('aria-expanded')==='true'?'false':'true')});hint.addEventListener('keydown',e=>{if(e.key==='Escape'){hint.setAttribute('aria-expanded','false');hint.dataset.tooltipDismissed='true'}});n.setAttribute('aria-describedby',[n.getAttribute('aria-describedby'),tip.id].filter(Boolean).join(' '));
if(n.tagName==='BUTTON'){const wrap=document.createElement('div');wrap.className='control-help';n.before(wrap);wrap.append(n,hint)}else n.after(hint);
}}
decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});

// Keep the current page and keyboard focus visible without moving the page vertically.
const menu=document.querySelector('.site-nav');
if(menu){const reveal=node=>{if(!node||node.hidden)return;const box=menu.getBoundingClientRect(),item=node.getBoundingClientRect();if(item.right>box.right-6)menu.scrollLeft+=item.right-box.right+6;else if(item.left<box.left+6)menu.scrollLeft-=box.left-item.left+6;};const current=()=>reveal(menu.querySelector('[aria-current="page"]'));menu.addEventListener('focusin',event=>reveal(event.target.closest('a')));new ResizeObserver(current).observe(menu);new MutationObserver(current).observe(menu,{attributes:true,subtree:true,attributeFilter:['hidden','aria-current']});requestAnimationFrame(current);}

// Offer a small return control only after the reader has moved down the page.
if(!document.getElementById('back-to-top')){
 const button=document.createElement('button');button.id='back-to-top';button.type='button';button.className='back-to-top';button.hidden=true;button.setAttribute('aria-label','Back to top');button.title='Back to top';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','24');svg.setAttribute('height','24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2.3');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M5.5 11.5 12 5l6.5 6.5M12 5v14');svg.append(path);button.append(svg);document.body.append(button);
 let queued=false;const update=()=>{button.hidden=window.scrollY<360;queued=false};window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});update();
 button.addEventListener('click',event=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});if(event.detail===0)document.getElementById('main-content')?.focus({preventScroll:true});});
}
