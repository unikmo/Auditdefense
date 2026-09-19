(() => {
function parseDate(value){if(!value)return null;const d=new Date(value+'T00:00:00Z');return Number.isNaN(d.getTime())?null:d}
function addMonths(date, months){const d=new Date(date.getTime());d.setUTCMonth(d.getUTCMonth()+months);return d}
function daysBetween(a,b){return Math.floor((b-a)/86400000)}
function normalize(v){return String(v||'').toLowerCase().trim()}
function selectRule(rules, context){
  const program=normalize(context.program);
  if(program.includes('ny medicaid managed care')) return rules.find(r=>r.programClass==='ny-medicaid-managed-care')||null;
  if(normalize(context.state)==='ny') return rules.find(r=>r.programClass==='commercial-health-plan')||null;
  return null;
}
function evaluate(input, rules, context={}){
  const rule=selectRule(rules||[],context);
  if(!rule) return {status:'NO_RULE_CONFIGURED',rule:null,reason:'No configured recovery-window rule matches this jurisdiction/program.'};
  if(input.exceptionClaimed) return {status:'EXCEPTION_MAY_APPLY',rule,reason:'A stated exception may change the ordinary recovery window and requires attorney review.'};
  const paid=parseDate(input.paymentReceivedDate), recovery=parseDate(input.recoveryInitiatedDate), notice=parseDate(input.noticeDate);
  if(!paid||!recovery) return {status:'INSUFFICIENT_DATES',rule,reason:'Payment-received date and recovery-initiation date are required.'};
  const deadline=addMonths(paid,rule.windowMonths);
  const outside=recovery>deadline;
  let noticeStatus='NOTICE_DATE_MISSING';
  let noticeDays=null;
  if(notice){noticeDays=daysBetween(notice,recovery);noticeStatus=noticeDays>=rule.noticeDays?'NOTICE_PERIOD_MET':'NOTICE_PERIOD_SHORT'}
  return {
    status:outside?'POTENTIALLY_OUTSIDE_WINDOW':'WITHIN_CONFIGURED_WINDOW',
    rule,
    paymentReceivedDate:input.paymentReceivedDate,
    recoveryInitiatedDate:input.recoveryInitiatedDate,
    deadline:deadline.toISOString().slice(0,10),
    months:rule.windowMonths,
    noticeDays,
    noticeStatus,
    reason:outside
      ? 'Recovery appears to have been initiated after the configured ordinary window. Check exceptions, contract terms and controlling program authority.'
      : 'Recovery appears to fall within the configured ordinary window. Other policy and notice challenges may still exist.'
  };
}
window.AuditDefendRecoveryEngine=Object.freeze({selectRule,evaluate});
})();