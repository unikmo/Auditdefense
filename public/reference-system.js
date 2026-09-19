(() => {
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let families=[],cases=[];

  function renderFamilies(){
    const root=$('issueFamilyGrid');
    if(!root)return;
    root.innerHTML=families.map((item,index)=>'<article class="issue-family-card"><span class="issue-family-number">'+String(index+1).padStart(2,'0')+'</span><div><h3>'+esc(item.label)+'</h3><p>'+esc(item.reviewQuestion)+'</p><small>'+esc(item.boundary)+'</small></div></article>').join('');
    const count=$('issueFamilyCount');if(count)count.textContent=families.length;
  }

  function renderFilters(){
    const issue=$('referenceIssueFilter'),jurisdiction=$('referenceJurisdictionFilter');
    if(issue)issue.innerHTML='<option value="all">All seven issues</option>'+families.map(item=>'<option value="'+esc(item.id)+'">'+esc(item.label)+'</option>').join('');
    if(jurisdiction){
      const values=[...new Set(cases.map(item=>item.jurisdiction))];
      jurisdiction.innerHTML='<option value="all">All jurisdictions</option>'+values.map(value=>'<option>'+esc(value)+'</option>').join('');
    }
  }

  function renderCases(){
    const root=$('referenceCaseList');if(!root)return;
    const filtered=window.AuditDefendReferenceEngine.filterCases(cases,{
      issueId:$('referenceIssueFilter')?.value||'all',
      jurisdiction:$('referenceJurisdictionFilter')?.value||'all',
      query:$('referenceSearch')?.value||''
    });
    const resultCount=$('referenceResultCount');if(resultCount)resultCount.textContent=filtered.length+' verified '+(filtered.length===1?'reference':'references');
    root.innerHTML=filtered.length?filtered.map(item=>{
      const issueLabels=(item.relatedIssueIds||[]).map(id=>families.find(f=>f.id===id)?.label||id);
      return '<article class="reference-card"><div class="reference-card-head"><div><span class="policy-status">'+esc(item.precedentialStatus)+'</span><h3>'+esc(item.caseName)+'</h3><p>'+esc(item.citation)+' · '+esc(item.court)+' · '+esc(item.decisionDate)+'</p></div><span class="pill info">Historical decision</span></div><div class="reference-meta"><span><b>Posture</b>'+esc(item.proceduralPosture)+'</span><span><b>Disposition</b>'+esc(item.disposition)+'</span></div><div class="reference-summary"><b>What the court decided</b><p>'+esc(item.holdingSummary)+'</p></div><div class="reference-relevance"><div><b>Why it may help</b><p>'+esc(item.relevance)+'</p></div><div class="reference-limit"><b>Limits on use</b><p>'+esc(item.limitations)+'</p></div></div><div class="reference-footer"><div>'+issueLabels.map(label=>'<span class="policy-chip warning">'+esc(label)+'</span>').join('')+'</div><a class="secondary-btn" href="'+esc(item.source.url)+'" target="_blank" rel="noopener noreferrer">Open official opinion ↗</a></div><small class="reference-verification">Source: '+esc(item.source.publisher)+' · '+esc(item.source.locator)+' · verified '+esc(item.source.verifiedOn)+'</small></article>';
    }).join(''):'<div class="empty-state compact"><b>No verified references match these filters.</b><p>Change the filters; absence of a result is not a legal conclusion.</p></div>';
  }

  async function init(){
    const state=$('referenceSystemState');
    try{
      const [issuePayload,casePayload]=await Promise.all([
        fetch('/issue-families.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('issue-families.json unavailable'))),
        fetch('/reference-cases.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('reference-cases.json unavailable')))
      ]);
      families=issuePayload.issueFamilies||[];cases=casePayload.cases||[];
      renderFamilies();renderFilters();renderCases();
      [$('referenceIssueFilter'),$('referenceJurisdictionFilter'),$('referenceSearch')].filter(Boolean).forEach(input=>input.addEventListener(input.tagName==='INPUT'?'input':'change',renderCases));
      if(state){state.textContent='Verified sources only · no outcome prediction';state.className='policy-monitor-state ok'}
    }catch(error){
      console.warn(error);
      if(state){state.textContent='Reference data unavailable';state.className='policy-monitor-state warn'}
      const root=$('referenceCaseList');if(root)root.innerHTML='<div class="empty-state compact"><b>Reference system unavailable.</b><p>No inference should be drawn from missing data.</p></div>';
    }
  }

  init();
})();
