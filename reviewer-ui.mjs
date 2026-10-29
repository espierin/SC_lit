export const accessLabels={read:'Full text read',partial:'Partially read',abstract_only:'Abstract only',unavailable:'Full text unavailable',not_recorded:'Access not recorded'};
export function reviewPresentation({items=[],publication={},dirty=false,error='',canReview=false,now=Date.now()}={}){
 const counts={all:items.length,pending:0,approved:0,excluded:0};for(const i of items){const decision=['pending','approved','excluded'].includes(i?.decision)?i.decision:'pending';counts[decision]++;}
 const complete=counts.all>0&&counts.pending===0,selected=counts.approved>0,p=publication;
 let stage=items.length?2:0,title=items.length?'Review in progress':'Waiting for a selection',next=items.length?'Check each article and record Approve or Exclude.':'The next saved selection will appear here.',tone='neutral';
 if(complete){title=selected?'Review complete':'All articles excluded';next=selected?'Wait for the saved Buffer confirmation.':'No post will be published from this selection.'}
 if(p.status==='scheduled'){stage=3;title=now>=Date.parse(p.dueAt||p.scheduledAt)?'Awaiting delivery confirmation':'Scheduled in Buffer';next='Buffer handles publication. Wait for confirmation before considering a manual post.';tone='info'}
 if(p.status==='sent'){stage=4;title='Publication confirmed';next='The post is published. Further review edits do not publish another copy.';tone='success'}
 else if(error){title='Saving needs attention';next='Your edits are retained in this browser. Reload the central version before resolving a conflict. A previously queued post may still publish.';tone='attention'}
 else if(dirty){title='Saving your changes';next='Wait for Saved centrally. The current Buffer queue changes only after a successful save.';tone='info'}
 else if(['needs_attention','error','blocked'].includes(p.status)){title='Publication needs attention';next='Check the Buffer queue and the reported issue. Do not retry or post manually until delivery is clear.';tone='attention'}
 else if(p.status==='sending'){title='Checking Buffer submission';next='Wait for confirmation. An uncertain submission must not be repeated.';tone='info'}
 else if(p.status==='paused'){title='Publication paused';next='Editorial review may continue. An administrator must resume publication.';tone='attention'}
 else if(p.status==='not_enabled'){title='Automatic publication unavailable';next='Contact an administrator before attempting manual publication.';tone='attention'}
 return{counts,complete,selected,stage,title,next,tone,canReview};
}
