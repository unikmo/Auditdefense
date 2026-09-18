(() => {
const normalize = value => String(value || '').toLowerCase().trim();

function appliesToCase(rule, context) {
  const a = rule.appliesTo || {};
  if (a.state && normalize(a.state) !== normalize(context.state)) return false;
  if (a.payer && normalize(a.payer) !== normalize(context.payer)) return false;
  if (a.program && !normalize(context.program).includes(normalize(a.program)) && !normalize(a.program).includes(normalize(context.program))) return false;
  return true;
}

function issueMatches(rule, claim) {
  const issues = claim.issues || [];
  return (rule.issueFamilies || []).some(issue => issues.includes(issue));
}

function temporalStatus(rule, claim, context) {
  const precision = context.dosPrecision || 'UNKNOWN';
  if (precision !== 'EXACT_DOS') return 'POLICY_VERSION_UNCERTAIN';
  if (!claim.dos) return 'POLICY_VERSION_UNCERTAIN';
  const dos = new Date(claim.dos + 'T00:00:00Z');
  const from = rule.effectiveFrom ? new Date(rule.effectiveFrom + 'T00:00:00Z') : null;
  const to = rule.effectiveTo ? new Date(rule.effectiveTo + 'T23:59:59Z') : null;
  if (from && dos < from) return 'POLICY_VERSION_UNCERTAIN';
  if (to && dos > to) return 'POLICY_VERSION_UNCERTAIN';
  if (!from && rule.historicalApplicability?.includes('REQUIRES_')) return 'POLICY_VERSION_UNCERTAIN';
  return 'POLICY_MATCH_CANDIDATE';
}

function evaluateClaim(claim, rules, context) {
  const candidates = (rules || []).filter(rule => appliesToCase(rule, context) && issueMatches(rule, claim));
  if (!candidates.length) {
    return {claimId:claim.id,status:'POLICY_BASIS_UNVERIFIED',candidates:[],reason:'No verified source-attribution rule has been mapped to this finding yet.'};
  }
  const temporal = candidates.map(rule => ({rule,status:temporalStatus(rule, claim, context)}));
  const versionUncertain = temporal.some(x => x.status === 'POLICY_VERSION_UNCERTAIN');
  return {
    claimId:claim.id,
    status:versionUncertain ? 'POLICY_VERSION_UNCERTAIN' : 'POLICY_MATCH_CANDIDATE',
    candidates:temporal,
    reason:versionUncertain
      ? 'Relevant current authorities were found, but the version effective on the exact date of service has not yet been established.'
      : 'Relevant authority candidates and temporal coverage were found; human review is still required before accepting or challenging the payer finding.'
  };
}

function evaluateCase(claims, rules, context) {
  return (claims || []).map(claim => evaluateClaim(claim, rules, context));
}

window.AuditDefendPolicyEngine = Object.freeze({appliesToCase, issueMatches, temporalStatus, evaluateClaim, evaluateCase});
})();