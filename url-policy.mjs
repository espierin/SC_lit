// Only canonical article DOI URLs belong in LinkedIn post text.
export function disallowedLinks(text){
 const urls=String(text).match(/(?:[a-z][a-z0-9+.-]*:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9-]+\.)+(?:com|org|net|io|site|eu|nl|uk|edu|gov|de|fr|be|app|dev|co|info)(?:\/[^\s<>"']*)?/gi)||[];
 return urls.filter(raw=>{const value=raw.replace(/[.,;!?)\]]+$/,'');try{const u=new URL(value);return !(u.protocol==='https:'&&u.hostname==='doi.org'&&!u.port&&!u.username&&!u.password&&/^\/10\.\d{4,9}\/\S+$/i.test(u.pathname)&&!u.search&&!u.hash)}catch{return true}});
}
export function assertPostLinks(text){const bad=disallowedLinks(text);if(bad.length)throw Error('Export blocked: only article DOI links (https://doi.org/10.…) are allowed. Remove: '+bad.join(', '));return text}
