(() => {
const normalize=value=>String(value||'').toLowerCase().trim();

function appliesToCase(rule,context){
  const a=rule.appliesTo||{};
  if(a.state&&normalize(a.state)!==normalize(context.state))return false;
  if(a.payer&&normalize(a.payer)!==normalize(context.payer))return false;
  if(a.program&&!normalize(context.program).includes(normalize(a.program))&&!normalize(a.program).includes(normalize(context.program)))return false;
  return true;
}

function issueMatches(rule,claim){
  const issues=claim.issues||[];
  return (rule.issueFamilies||[]).some(issue=>issues.includes(issue));
}

function temporalStatus(rule,claim,context){
  const precision=context.dosPrecision||'UNKNOWN';
  if(precision!=='EXACT_DOS')return'POLICY_VERSION_UNCERTAIN';
  if(!claim.dos)return'POLICY_VERSION_UNCERTAIN';
  const dos=new Date(claim.dos+'T00:00:00Z');
  const from=rule.effectiveFrom?new Date(rule.effectiveFrom+'T00:00:00Z'):null;
  const to=rule.effectiveTo?new Date(rule.effectiveTo+'T23:59:59Z'):null;
  if(from&&dos<from)return'POLICY_VERSION_UNCERTAIN';
  if(to&&dos>to)return'POLICY_VERSION_UNCERTAIN';
  if(!from&&rule.historicalApplicability?.includes('REQUIRES_'))return'POLICY_VERSION_UNCERTAIN';
  return'POLICY_MATCH_CANDIDATE';
}

function citationsForRule(rule){
  return [rule.citation,rule.pdfCitation].filter(c=>c&&c.sourceUrl&&c.locator);
}

function allCitations(candidates){
  const seen=new Set(),out=[];
  for(const item of candidates||[]){
    for(const citation of citationsForRule(item.rule||item)){
      const key=(citation.deepLink||citation.sourceUrl)+'|'+citation.locator;
      if(!seen.has(key)){seen.add(key);out.push(citation)}
    }
  }
  return out;
}

function evaluateClaim(claim,rules,context,options={}){
  const candidates=(rules||[]).filter(rule=>appliesToCase(rule,context)&&issueMatches(rule,claim));
  if(!candidates.length){
    return{claimId:claim.id,status:'POLICY_BASIS_UNVERIFIED',candidates:[],citations:[],reason:'No verified source-attribution rule has been mapped to this finding yet.'};
  }
  const temporal=candidates.map(rule=>({rule,status:temporalStatus(rule,claim,context)}));
  const versionUncertain=temporal.some(x=>x.status==='POLICY_VERSION_UNCERTAIN');
  const citations=allCitations(temporal);
  const mismatchVerified=options.mismatchVerified===true;
  let status=versionUncertain?'POLICY_VERSION_UNCERTAIN':'POLICY_MATCH_CANDIDATE';
  if(mismatchVerified&&!versionUncertain&&citations.length)status='POLICY_CONFLICT_CANDIDATE';
  if(mismatchVerified&&!citations.length)status='HUMAN_REVIEW_REQUIRED';
  return{
    claimId:claim.id,
    status,
    candidates:temporal,
    citations,
    challengePacket:{
      eligible:status==='POLICY_CONFLICT_CANDIDATE',
      citationRequired:true,
      citationCount:citations.length,
      attorneyReviewRequired:true
    },
    reason:status==='POLICY_CONFLICT_CANDIDATE'
      ?'A policy mismatch has been marked verified and at least one authoritative citation is attached. Attorney review is required before challenge language is used.'
      :versionUncertain
        ?'Relevant current authorities were found, but the version effective on the exact date of service has not yet been established.'
        :'Relevant authority candidates and temporal coverage were found; human review is still required before accepting or challenging the payer finding.'
  };
}

function evaluateCase(claims,rules,context,optionsByClaim={}){
  return(claims||[]).map(claim=>evaluateClaim(claim,rules,context,optionsByClaim[claim.id]||{}));
}

function buildChallengePacket(result){
  if(!result)return null;
  return{
    status:result.status,
    sourceLinked:(result.citations||[]).length>0,
    citations:result.citations||[],
    attorneyReviewRequired:true,
    mayChallenge:result.status==='POLICY_CONFLICT_CANDIDATE'
  };
}

window.AuditDefendPolicyEngine=Object.freeze({appliesToCase,issueMatches,temporalStatus,citationsForRule,allCitations,evaluateClaim,evaluateCase,buildChallengePacket});
})();