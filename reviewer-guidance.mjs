export const formatAmsterdam=value=>value?new Date(value).toLocaleString('en-GB',{timeZone:'Europe/Amsterdam',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+' Amsterdam':'Not recorded';
export function finalDecisionHint({pending,approved,canReview,status,paused=false,dueAt,now=Date.now()}){
 if(!canReview||pending!==1||['sent','sending','needs_attention'].includes(status))return '';
 if(paused||status==='paused')return 'One decision remains. Your decision will save centrally; automatic publication is paused.';
 const timing=dueAt&&now>=Date.parse(dueAt)?'submitted immediately because the planned publication time has passed':dueAt?'scheduled through Buffer for '+formatAmsterdam(dueAt):'submitted to Buffer using the saved publication schedule';
 return 'One decision remains. Saving it completes the review. '+(approved?'The approved articles will then be '+timing+'.':'If at least one article is approved, the post will then be '+timing+'. Excluding all articles creates no post.');
}
export function publicationIssue(status,message=''){
 if(/shorten|3,000|3000|character/i.test(message))return{title:'Post is too long',action:'Shorten the approved text, then save it again.'};
 if(/DOI|links|URL/i.test(message))return{title:'Post contains an unsupported link',action:'Keep only direct article DOI links in the post text.'};
 if(/number|sequence|published history/i.test(message))return{title:'Edition number needs verification',action:'Ask an administrator to verify the last confirmed edition before continuing.'};
 return{title:status==='sending'?'Buffer submission is being checked':'Buffer needs attention',action:'Check the existing Buffer queue before retrying or posting manually. A connection failure does not prove that submission failed.'};
}
export const deliveryIssueLabels={review_or_submission_required:'Review or Buffer submission is still incomplete.',unexpected_channel:'The saved destination does not match the EFI channel.',missing_buffer_post:'The saved post could not be found in Buffer.',published_link_pending:'Published; the LinkedIn link is not available yet.',delivery_overdue:'The scheduled publication has not been confirmed.',buffer_check_failed:'Buffer could not be reached to verify delivery.',review_busy:'A review was being saved; delivery will be checked again.'};

export function publicationTime(date,posting){
 if(!date||!posting)return null;const base=new Date(date+'T12:00Z');base.setUTCDate(base.getUTCDate()+((posting.day-base.getUTCDay()+7)%7||7));const [h,m]=posting.time.split(':').map(Number);let value=new Date(base.toISOString().slice(0,10)+'T'+posting.time+':00Z');
 for(let n=0;n<3;n++){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(value).map(p=>[p.type,p.value]));value=new Date(+value+(h-Number(parts.hour))*3600000+(m-Number(parts.minute))*60000)}return value.toISOString();
}
