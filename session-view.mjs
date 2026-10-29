// A short-lived display hint only. Protected data and writes still require server authentication.
export const IDENTITY_FRESH_MS=60000;
export function cachedIdentity(session,now=Date.now()){
 const profile=session?.profile,age=now-session?.profileCheckedAt;
 if(!session?.token||!(session.expiresAt>now)||!profile||profile.email!==session.email||typeof profile.name!=='string'||typeof profile.role!=='string'||typeof profile.canAnnouncement!=='boolean'||!Number.isFinite(age)||age<0||age>=IDENTITY_FRESH_MS)return null;
 return profile;
}
export function withIdentity(session,profile,now=Date.now()){
 return {...session,email:profile.email,profile:{...profile},profileCheckedAt:now};
}
