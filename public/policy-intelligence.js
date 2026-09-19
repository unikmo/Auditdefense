(() => {
const $=id=>document.getElementById(id);
const claims=window.AuditDefendCaseData?.claims||[];
const caseContext=window.AuditDefendCaseData?.caseContext||{payer:'Anthem',program:'NY Medicaid Managed Care',state:'NY',dosPrecision:'YEAR_ONLY_REDACTED'};
const enrollmentClaims=claims.filter(c=>c.issues.includes('NPI enrollment on DOS'));
const reversals=claims.filter(c=>c.initial==='A'&&c.rebuttal==='B');
const initialDoc=claims.filter(c=>c.initial==='B');
let policyRules=[],evaluations=[],recoveryRules=[],policyChanges=[];

const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleString():'Not yet observed';
const daysUntil=v=>Math.ceil((new Date(v+'T00:00:00Z')-new Date())/86400000);
const toneForStatus=s=>s==='POLICY_MATCH_CANDIDATE'||s==='WITHIN_CONFIGURED_WINDOW'?'good':s==='POLICY_CONFLICT_CANDIDATE'||s==='POTENTIALLY_OUTSIDE_WINDOW'?'danger':'warning';

function renderCandidates(){
  const root=$('policyCandidates'); if(!root)return;
  const candidates=[
    {title:'Provider / NPI enrollment basis',status:'POLICY VERSION CHECK REQUIRED',tone:'warning',count:enrollmentClaims.length+' claim lines',detail:'The payer worksheet applies an enrollment-on-DOS finding. Current NY Medicaid/Anthem authorities are mapped, but the exact version effective on each DOS still has to be established.',next:'Policy version → enrollment effective-date evidence → affected claim universe.'},
    {title:'Rebuttal reversals',status:'HIGH-PRIORITY POLICY REVIEW',tone:'danger',count:reversals.length+' A → B lines',detail:'These lines passed the initial review and failed after rebuttal. Each reversal should show the newly applied rule and its source before the finding is accepted.',next:'Open the cited policy, verify the effective version, then compare the payer finding.'},
    {title:'Documentation support',status:'SOURCE-LINKED RULE ATTRIBUTION',tone:'info',count:initialDoc.length+' initially unsupported',detail:'Documentation findings are tied to authoritative payer/state sources with page or section references where available.',next:'Attorney reviews the exact cited text before relying on or challenging the finding.'}
  ];
  root.innerHTML=candidates.map(c=>'<article class="policy-candidate '+c.tone+'"><div><span class="policy-status">'+esc(c.status)+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.detail)+'</p><small><b>Next:</b> '+esc(c.next)+'</small></div><strong>'+esc(c.count)+'</strong></article>').join('');
}

function citationHtml(citation){
  if(!citation)return'';
  const href=citation.deepLink||citation.sourceUrl;
  return '<div class="policy-citation-mini"><div><b>'+esc(citation.sourceTitle||'Policy source')+'</b><small>'+esc(citation.locator||'Source')+'</small><q>'+esc(citation.excerpt||'')+'</q></div><a class="action-link" href="'+href+'" target="_blank" rel="noopener noreferrer">'+(citation.kind==='pdf-page'?'Open PDF page':'Open cited policy')+' ↗</a></div>';
}

function renderClaimPolicyLinks(){
  const body=$('policyClaimRows'); if(!body)return;
  body.innerHTML=reversals.map(c=>{
    const result=evaluations.find(x=>x.claimId===c.id);
    const status=result?.status||'POLICY_BASIS_UNVERIFIED';
    const citations=(result?.citations||[]).slice(0,3);
    const tone=toneForStatus(status);
    return '<tr><td><b>'+c.id+'</b></td><td>'+c.year+'</td><td>'+c.cpt+'</td><td>A → B</td><td>NPI enrollment on DOS</td><td><span class="policy-chip '+tone+'">'+esc(status.replaceAll('_',' '))+'</span></td><td class="policy-source-cell">'+(citations.length?citations.map(citationHtml).join(''):'<span class="policy-chip warning">No source citation yet</span>')+'</td></tr>';
  }).join('');
}

function renderSourcePacket(){
  const root=$('policySourcePacket'); if(!root)return;
  const seen=new Set(),rows=[];
  for(const result of evaluations){
    for(const c of result.citations||[]){
      const key=(c.deepLink||c.sourceUrl)+'|'+c.locator;
      if(!seen.has(key)){seen.add(key);rows.push(c)}
    }
  }
  root.innerHTML=rows.length?rows.map(c=>'<article class="policy-source-card"><span class="policy-status">'+esc(c.kind==='pdf-page'?'PDF PAGE CITATION':'AUTHORITATIVE SOURCE')+'</span><h3>'+esc(c.sourceTitle)+'</h3><p class="policy-locator">'+esc(c.locator)+'</p><blockquote>“'+esc(c.excerpt)+'”</blockquote><div class="policy-source-actions"><a class="secondary-btn" href="'+(c.deepLink||c.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+(c.kind==='pdf-page'?'Open exact PDF page':'Open highlighted policy')+' ↗</a><a class="action-link" href="'+c.sourceUrl+'" target="_blank" rel="noopener noreferrer">Full source</a></div></article>').join(''):'<p class="card-copy">No source-linked citations are available yet.</p>';
}

function renderRecovery(){
  const root=$('recoveryRights'); if(!root)return;
  const current=window.AuditDefendRecoveryEngine?.evaluate({},recoveryRules,caseContext);
  const commercialExample=window.AuditDefendRecoveryEngine?.evaluate({paymentReceivedDate:'2024-08-01',recoveryInitiatedDate:'2026-09-02',noticeDate:'2026-08-01'},recoveryRules,{state:'NY',program:'Commercial'});
  const medicaidExample=window.AuditDefendRecoveryEngine?.evaluate({paymentReceivedDate:'2024-08-01',recoveryInitiatedDate:'2026-09-02',noticeDate:'2026-08-01'},recoveryRules,{state:'NY',program:'NY Medicaid Managed Care'});
  function block(title,r,example){
    if(!r?.rule)return'<article class="recovery-card"><h3>'+esc(title)+'</h3><p>No configured rule.</p></article>';
    const citation=r.rule.citation;
    return '<article class="recovery-card '+(r.status==='POTENTIALLY_OUTSIDE_WINDOW'?'risk':'')+'"><span class="policy-status">'+(example?'ILLUSTRATIVE RULE CHECK':'CURRENT CASE')+'</span><h3>'+esc(title)+'</h3><div class="recovery-result"><span class="policy-chip '+toneForStatus(r.status)+'">'+esc(r.status.replaceAll('_',' '))+'</span><b>'+r.rule.windowMonths+' months</b></div><p>'+esc(r.reason)+'</p><small>Anchor: '+esc(r.rule.anchorField)+' · notice: '+r.rule.noticeDays+' days</small>'+(citation?'<div class="policy-citation-mini"><div><b>'+esc(citation.sourceTitle)+'</b><small>'+esc(citation.locator)+'</small><q>'+esc(citation.excerpt)+'</q></div><a class="action-link" href="'+(citation.deepLink||citation.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read rule ↗</a></div>':'')+'</article>';
  }
  root.innerHTML=block('This Anthem NY Medicaid Managed Care sample',current,false)+block('Example: NY commercial claim recovered after 25 months',commercialExample,true)+block('Same 25-month example under NY Medicaid Managed Care',medicaidExample,true);
}

function renderUpcomingChanges(){
  const root=$('upcomingPolicyChanges'); if(!root)return;
  const upcoming=(policyChanges||[]).filter(x=>x.status==='UPCOMING_VERIFIED').sort((a,b)=>a.effectiveFrom.localeCompare(b.effectiveFrom));
  const count=$('upcomingPolicyCount'); if(count)count.textContent=upcoming.length;
  root.innerHTML=upcoming.length?upcoming.map(item=>{
    const days=daysUntil(item.effectiveFrom);
    return '<article class="change-card"><div class="change-date"><strong>'+days+'</strong><span>days</span></div><div><span class="policy-status">'+esc(item.payer)+' · EFFECTIVE '+esc(item.effectiveFrom)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.changeSummary)+'</p><small><b>Potential client impact:</b> '+esc(item.clientImpact)+'</small><div class="change-actions"><a class="secondary-btn" href="'+(item.deepLink||item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read announcement ↗</a><q>'+esc(item.excerpt)+'</q></div></div></article>';
  }).join(''):'<div class="empty-state compact"><b>No verified future-dated changes in the current watch list.</b><p>Detected source changes enter human review before a client alert is issued.</p></div>';
}

async function renderSources(){
  const table=$('policySourcesBody'),state=$('policyMonitorState'),count=$('policySourceCount'),alerts=$('policyChangeCount');
  if(!table)return;
  try{
    const [registry,status,rulesPayload,recoveryPayload,changesPayload]=await Promise.all([
      fetch('/policy-sources.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('policy-sources.json unavailable'))),
      fetch('/policy-status.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('policy-status.json unavailable'))),
      fetch('/policy-rules.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('policy-rules.json unavailable'))),
      fetch('/recovery-rules.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('recovery-rules.json unavailable'))),
      fetch('/policy-changes.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('policy-changes.json unavailable')))
    ]);
    policyRules=rulesPayload.rules||[];
    recoveryRules=recoveryPayload.rules||[];
    policyChanges=changesPayload.announcements||[];
    evaluations=window.AuditDefendPolicyEngine?.evaluateCase(claims,policyRules,caseContext)||[];
    window.AuditDefendPolicyState={rules:policyRules,evaluations,recoveryRules,policyChanges};
    renderClaimPolicyLinks();renderSourcePacket();renderRecovery();renderUpcomingChanges();

    const sourceMap=new Map(status.sources.map(s=>[s.id,s]));
    if(count)count.textContent=registry.sources.length;
    if(alerts)alerts.textContent=status.sources.filter(s=>s.reviewRequired).length;
    const navBadge=$('policyNavBadge');
    if(navBadge)navBadge.textContent=String(status.sources.filter(s=>s.reviewRequired).length+policyChanges.filter(x=>x.status==='UPCOMING_VERIFIED').length);
    if(state){
      state.textContent=(status.monitoringState==='ACTIVE'?'Monitor active':'Monitor needs review')+' · '+status.schedule;
      state.className='policy-monitor-state '+(status.monitoringState==='ACTIVE'?'ok':'warn');
    }
    table.innerHTML=registry.sources.map(src=>{
      const obs=sourceMap.get(src.id)||{};
      const label=obs.state==='CHANGED_REVIEW_REQUIRED'?'Changed — review':obs.state==='FETCH_ERROR'?'Source error':obs.hash?'Observed':'Seeded';
      const tone=obs.state==='CHANGED_REVIEW_REQUIRED'||obs.state==='FETCH_ERROR'?'danger':obs.hash?'good':'warning';
      return '<tr><td><b>'+esc(src.title)+'</b><small>'+esc(src.category)+'</small></td><td>'+esc(src.authority)+'</td><td>'+esc(src.program)+'</td><td>'+esc(src.cadence)+'</td><td><span class="policy-chip '+tone+'">'+esc(label)+'</span><small>'+esc(fmtDate(obs.lastObservedAt))+'</small></td><td><a class="action-link" href="'+src.url+'" target="_blank" rel="noopener noreferrer">Source ↗</a></td></tr>';
    }).join('');
  }catch(error){
    console.warn(error);
    if(state){state.textContent='Policy source registry could not be loaded.';state.className='policy-monitor-state warn'}
    table.innerHTML='<tr><td colspan="6">Policy source status unavailable.</td></tr>';
  }
}

renderCandidates();
renderClaimPolicyLinks();
renderSources();
})();