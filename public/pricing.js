(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.AuditDefendPricing=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const tiers=[
    {id:'essential',max:100000,label:'Up to $100,000',standard:999,member:299},
    {id:'priority',max:250000,label:'$100,000.01–$250,000',standard:1499,member:449},
    {id:'major',max:Infinity,label:'Above $250,000',standard:1999,member:599}
  ];
  const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  function tierFor(exposure){
    if(exposure===''||exposure===null||exposure===undefined) return null;
    const amount=Number(exposure);
    if(!Number.isFinite(amount)||amount<0) return null;
    return tiers.find(tier=>amount<=tier.max)||tiers[tiers.length-1];
  }
  function quote({exposure,claimCount=0,multiplePayers=false,unstructuredData=false,memberStatus='standard'}={}){
    const tier=tierFor(exposure);
    const scopeReasons=[];
    if(Number(claimCount)>500) scopeReasons.push('More than 500 claim lines');
    if(multiplePayers) scopeReasons.push('Multiple payers');
    if(unstructuredData) scopeReasons.push('Unstructured claim data');
    const memberEligible=memberStatus==='member90'||memberStatus==='annualEligible';
    return {
      tier,
      memberEligible,
      amount:tier?(memberEligible?tier.member:tier.standard):null,
      scopeReview:scopeReasons.length>0,
      scopeReasons,
      label:tier?`${money(memberEligible?tier.member:tier.standard)} ${memberEligible?'eligible member':'standard'} case fee`:'Exposure required'
    };
  }
  return {tiers,tierFor,quote,money};
});
