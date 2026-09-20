(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AuditDefendEngagement=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const STATUS=Object.freeze({
    INVITATION_SENT:'Invitation sent',
    CONFLICT_PENDING:'Conflict check pending',
    ENGAGEMENT_CONFIRMED:'Engagement confirmed',
    ACCESS_GRANTED:'Provider grants access',
    DECLINED:'Declined',
    CANCELLED:'Cancelled'
  });
  const PRIMARY=Object.freeze([STATUS.INVITATION_SENT,STATUS.CONFLICT_PENDING,STATUS.ENGAGEMENT_CONFIRMED,STATUS.ACCESS_GRANTED]);
  const TRANSITIONS=Object.freeze({
    [STATUS.INVITATION_SENT]:Object.freeze([STATUS.CONFLICT_PENDING,STATUS.DECLINED,STATUS.CANCELLED]),
    [STATUS.CONFLICT_PENDING]:Object.freeze([STATUS.ENGAGEMENT_CONFIRMED,STATUS.DECLINED]),
    [STATUS.ENGAGEMENT_CONFIRMED]:Object.freeze([STATUS.ACCESS_GRANTED]),
    [STATUS.ACCESS_GRANTED]:Object.freeze([]),
    [STATUS.DECLINED]:Object.freeze([]),
    [STATUS.CANCELLED]:Object.freeze([])
  });
  function canTransition(from,to){return (TRANSITIONS[from]||[]).includes(to)}
  function assertTransition(from,to,actor){
    if(!canTransition(from,to))throw new Error('Invalid engagement transition: '+from+' → '+to+'.');
    const required=to===STATUS.ACCESS_GRANTED?'provider':to===STATUS.CANCELLED?'provider':'attorney';
    if(actor!==required)throw new Error(required+' action required for '+to+'.');
    return true;
  }
  function documentsVisible(status){return status===STATUS.ACCESS_GRANTED}
  function progress(status){const index=PRIMARY.indexOf(status);return PRIMARY.map((label,i)=>({label,complete:index>=i,current:index===i}))}
  function includedIntroductions(used=0){const count=Math.max(0,Number(used)||0);return{used:count,limit:3,remaining:Math.max(0,3-count),included:count<3}}
  function normalize(record={}){return{...record,status:PRIMARY.includes(record.status)||[STATUS.DECLINED,STATUS.CANCELLED].includes(record.status)?record.status:STATUS.INVITATION_SENT,redacted:true,containsPhi:false}}
  return Object.freeze({STATUS,PRIMARY,TRANSITIONS,canTransition,assertTransition,documentsVisible,progress,includedIntroductions,normalize});
});
