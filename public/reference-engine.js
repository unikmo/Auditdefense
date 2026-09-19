(() => {
  const normalize=value=>String(value||'').trim().toLowerCase();

  function filterCases(cases=[],filters={}){
    const issueId=normalize(filters.issueId);
    const jurisdiction=normalize(filters.jurisdiction);
    const query=normalize(filters.query);
    return cases.filter(item=>{
      if(issueId&&issueId!=='all'&&!(item.relatedIssueIds||[]).includes(filters.issueId))return false;
      if(jurisdiction&&jurisdiction!=='all'&&normalize(item.jurisdiction)!==jurisdiction)return false;
      if(query){
        const haystack=[item.caseName,item.citation,item.court,item.holdingSummary,item.materialFacts,item.relevance,item.limitations].map(normalize).join(' ');
        if(!haystack.includes(query))return false;
      }
      return true;
    });
  }

  function buildReferenceResult(item){
    if(!item)return null;
    return {
      resultType:'HISTORICAL_REFERENCE',
      caseId:item.id,
      caseName:item.caseName,
      disposition:item.disposition,
      holdingSummary:item.holdingSummary,
      relevance:item.relevance,
      limitations:item.limitations,
      source:item.source
    };
  }

  window.AuditDefendReferenceEngine={filterCases,buildReferenceResult};
})();
