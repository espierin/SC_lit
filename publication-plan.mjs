// A Friday draft is intended for the following Monday at 08:00 Europe/Amsterdam.
export function scheduledPublication(editionDate){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(editionDate))throw Error('Invalid edition date');
 const day=new Date(editionDate+'T12:00:00Z');const days=(8-day.getUTCDay())%7||7;day.setUTCDate(day.getUTCDate()+days);
 const date=day.toISOString().slice(0,10);let candidate=new Date(date+'T08:00:00Z');
 for(let i=0;i<2;i++){const local=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(candidate).map(p=>[p.type,p.value]));candidate=new Date(+candidate+(8-Number(local.hour))*3600000-Number(local.minute)*60000)}
 return candidate.toISOString();
}
export function publicationPlan(edition,review,now=new Date(),published=false){
 const scheduledAt=scheduledPublication(edition.date);if(published)return{status:'already_published',scheduledAt};
 const items=edition.items.map(i=>review?.items?.[i.id]);if(!items.length||items.some(i=>!i||i.decision==='pending')||!items.some(i=>i.decision==='approved'))return{status:'awaiting_approval',scheduledAt};
 return{status:+now>=+new Date(scheduledAt)?'ready_to_publish':'scheduled',scheduledAt};
}
