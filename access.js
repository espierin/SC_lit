const PROTECTED=new Set(['','index.html','admin.html','announcement.html','help.html','newsletter.html']);
export function applyAccess(user){
 const signed=!!user;document.documentElement.dataset.auth=signed?'signed-in':'guest';
 const adminPage=document.body.dataset.page==='admin';const allowed=signed&&(!adminPage||user.role==='admin')&&(document.body.dataset.page!=='newsletter'||user.canNewsletter===true);
 const content=document.getElementById('protected-content');if(content)content.hidden=!allowed;
 const gate=document.getElementById('access-notice');if(gate){gate.hidden=allowed;gate.textContent=signed?'This account does not have access to this page.':'Sign in to open this page. Year archive is available without an account.';}
 for(const a of document.querySelectorAll('[data-newsletter-pilot-link]'))a.hidden=!user?.canNewsletter;
 for(const a of document.querySelectorAll('a[href]')){const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.startsWith('/SC_lit/')&&!url.pathname.startsWith(location.pathname.slice(0,location.pathname.lastIndexOf('/')+1)))continue;const file=url.pathname.split('/').pop();if(!PROTECTED.has(file))continue;const locked=!signed||(file==='admin.html'&&user?.role!=='admin')||(file==='newsletter.html'&&!user?.canNewsletter);a.classList.toggle('access-locked',locked);if(locked){a.title=file==='admin.html'&&signed?'Administrator access required':'Sign in required';a.dataset.accessLocked='true'}else if(a.dataset.accessLocked){a.removeAttribute('title');delete a.dataset.accessLocked}}
}
