(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.AuditDefendGates=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const isDone=g=>!!g&&g.status==='complete'&&typeof g.evidence==='string'&&g.evidence.trim().length>0;
  function evaluate(config){
    const gates=(config&&Array.isArray(config.gates))?config.gates:[];
    const open=gates.filter(g=>!isDone(g));
    return {total:gates.length,complete:gates.length-open.length,open:open.map(g=>g.id),phiAllowed:gates.length>0&&open.length===0};
  }
  // Fails closed: missing/invalid config means PHI is NOT allowed.
  function phiAllowed(config){return evaluate(config).phiAllowed}
  return {evaluate,phiAllowed};
});
