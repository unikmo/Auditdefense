const caseData = window.AuditDefendCaseData;
const claims = caseData?.claims || [];

const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
const pct = (part,total) => total ? Math.round((part/total)*100) : 0;

const summary = (() => {
  const total = claims.length;
  const initialSupported = claims.filter(c=>c.initial==='A').length;
  const initialUnsupported = claims.filter(c=>c.initial==='B').length;
  const finalSupported = claims.filter(c=>c.rebuttal==='A').length;
  const finalUnsupported = claims.filter(c=>c.rebuttal==='B').length;
  const changedToUnsupported = claims.filter(c=>c.initial==='A' && c.rebuttal==='B').length;
  const changedToSupported = claims.filter(c=>c.initial==='B' && c.rebuttal==='A').length;
  const paidTotal = claims.reduce((sum,c)=>sum+c.paid,0);
  const supportedPaid = claims.filter(c=>c.rebuttal==='A').reduce((sum,c)=>sum+c.paid,0);
  const atRiskPaid = paidTotal-supportedPaid;
  return {total,initialSupported,initialUnsupported,finalSupported,finalUnsupported,changedToUnsupported,changedToSupported,paidTotal,supportedPaid,atRiskPaid};
})();

function transitionLabel(c){
  if(c.initial==='A'&&c.rebuttal==='B') return 'Supported → Not supported';
  if(c.initial==='B'&&c.rebuttal==='A') return 'Not supported → Supported';
  if(c.rebuttal==='A') return 'Supported → Supported';
  return 'Not supported → Not supported';
}

function primaryReason(c){
  if(c.rebuttal==='A') return 'Documentation supported';
  if(c.initial==='A'&&c.rebuttal==='B') return 'NPI enrollment on DOS';
  return c.issues.join(' + ') || 'Payer finding';
}

function statusClass(c){return c.rebuttal==='A'?'status-supported':'status-review'}

function renderDashboardSummary(){
  const map = {
    claimsReviewed: summary.total,
    initialErrorRate: `${pct(summary.initialUnsupported,summary.total)}%`,
    finalUnsupportedRate: `${pct(summary.finalUnsupported,summary.total)}%`,
    finalSupported: summary.finalSupported,
    sampleAtRisk: money(summary.atRiskPaid),
    assertedOverpayment: money(caseData.assertedOverpayment)
  };
  Object.entries(map).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value});
  const initial = document.getElementById('initialReviewText');
  const rebuttal = document.getElementById('rebuttalReviewText');
  const shift = document.getElementById('reviewShiftText');
  const paid = document.getElementById('samplePaidText');
  const riskPct = document.getElementById('sampleRiskPct');
  if(initial) initial.textContent=`${summary.initialSupported} supported · ${summary.initialUnsupported} not supported`;
  if(rebuttal) rebuttal.textContent=`${summary.finalSupported} supported · ${summary.finalUnsupported} not supported`;
  if(shift) shift.textContent=`${summary.changedToUnsupported} claims moved from supported to not supported after rebuttal; ${summary.changedToSupported} moved the other way.`;
  if(paid) paid.textContent=`${money(summary.atRiskPaid)} of ${money(summary.paidTotal)} sampled paid dollars remain at risk.`;
  if(riskPct) riskPct.textContent=`${pct(summary.atRiskPaid,summary.paidTotal)}%`;
}

function filteredClaims(filter='all'){
  if(filter==='changed') return claims.filter(c=>c.initial!==c.rebuttal);
  if(filter==='unsupported') return claims.filter(c=>c.rebuttal==='B');
  if(filter==='supported') return claims.filter(c=>c.rebuttal==='A');
  if(filter==='enrollment') return claims.filter(c=>c.issues.includes('NPI enrollment on DOS'));
  return claims;
}

function renderFindings(filter='all'){
  const body=document.getElementById('findingsBody');
  if(!body) return;
  const rows=filteredClaims(filter).slice(0,10);
  body.innerHTML=rows.map((c)=>`<tr>
    <td><strong>${c.id}</strong></td><td>${c.year}</td><td>${c.cpt}</td><td>${money(c.paid)}</td>
    <td><span class="review-code ${c.initial==='A'?'code-a':'code-b'}">${c.initial}</span></td>
    <td><span class="review-code ${c.rebuttal==='A'?'code-a':'code-b'}">${c.rebuttal}</span></td>
    <td class="issue-cell">${primaryReason(c)}</td>
    <td><span class="status-pill ${statusClass(c)}">${c.rebuttal==='A'?'Supported':'At risk'}</span></td>
    <td><button class="action-link" data-claim-id="${c.id}">View</button></td>
  </tr>`).join('');
  const footer=document.getElementById('findingsFooter');
  if(footer) footer.textContent=`Showing ${rows.length} of ${filteredClaims(filter).length} matching claim lines`;
}

function renderClaims(){
  const body=document.getElementById('claimsBody');
  if(!body) return;
  body.innerHTML=claims.map(c=>`<tr>
    <td><strong>${c.id}</strong></td><td>${c.year}</td><td>${c.cpt}</td><td>${c.units}</td><td>${money(c.charged)}</td><td>${money(c.paid)}</td>
    <td><span class="review-code ${c.initial==='A'?'code-a':'code-b'}">${c.initial}</span></td>
    <td><span class="review-code ${c.rebuttal==='A'?'code-a':'code-b'}">${c.rebuttal}</span></td>
    <td class="issue-cell">${transitionLabel(c)}</td><td class="issue-cell">${primaryReason(c)}</td>
    <td><button class="action-link" data-claim-id="${c.id}">Open</button></td>
  </tr>`).join('');
}

function renderGaps(){
  const q=document.getElementById('gapQueue');
  if(!q) return;
  const items=[
    {title:'Initial documentation review',count:summary.initialUnsupported,detail:`${summary.initialUnsupported} of ${summary.total} lines were initially coded B (documentation did not support the billed service).`,tone:'high'},
    {title:'Rebuttal reversals',count:summary.changedToUnsupported,detail:`${summary.changedToUnsupported} lines were initially supported but became unsupported after rebuttal review, driven by NPI enrollment findings on the date of service.`,tone:'high'},
    {title:'Final supported lines',count:summary.finalSupported,detail:`Only ${summary.finalSupported} of ${summary.total} lines remained supported after rebuttal review.`,tone:'medium'},
    {title:'Sample paid dollars at risk',count:money(summary.atRiskPaid),detail:`This is ${pct(summary.atRiskPaid,summary.paidTotal)}% of the ${money(summary.paidTotal)} paid across the 30 sampled lines. It is separate from the case-wide asserted overpayment.`,tone:'medium'}
  ];
  q.innerHTML=items.map(i=>`<div class="gap-item real-gap"><span class="gap-severity ${i.tone}">!</span><div><strong>${i.title}</strong><small>${i.detail}</small></div><div class="gap-amount">${i.count}</div></div>`).join('');
}

function renderProviderMatrix(){
  const el=document.getElementById('providerMatrix');
  if(!el) return;
  const groups=[...new Set(claims.map(c=>c.provider))].map(provider=>{
    const rows=claims.filter(c=>c.provider===provider);
    return {provider,count:rows.length,unsupported:rows.filter(c=>c.rebuttal==='B').length,paid:rows.reduce((s,c)=>s+c.paid,0)};
  });
  el.innerHTML=groups.map(g=>`<tr><td><strong>${g.provider}</strong></td><td>${g.count}</td><td>${g.unsupported}</td><td>${money(g.paid)}</td><td>Verify enrollment effective dates against each DOS</td></tr>`).join('');
}

function renderCounselIssueMap(){
  const el=document.getElementById('counselIssueMap');
  if(!el) return;
  const changed=claims.filter(c=>c.initial==='A'&&c.rebuttal==='B');
  el.innerHTML=changed.map(c=>`<tr><td>${c.id}</td><td>${c.year}</td><td>${money(c.paid)}</td><td>A → B</td><td>NPI enrollment on DOS</td><td>Enrollment effective-date proof / payer enrollment record</td></tr>`).join('');
}

function showView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  const target=document.getElementById(`view-${view}`)||document.getElementById('view-dashboard');
  target.classList.add('active');
  document.getElementById('sidebar')?.classList.remove('open');
  history.replaceState(null,'',`#${view}`);
  window.scrollTo({top:0,behavior:'smooth'});
}

function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),3200)}

function policyEvidenceForClaim(data){
  const result=window.AuditDefendPolicyState?.evaluations?.find(x=>x.claimId===data.id);
  if(!result){
    return '<span class="policy-chip warning">POLICY BASIS LOADING / UNVERIFIED</span><p class="drawer-copy">Open Policy Intelligence to review the exact payer/program authority and effective version.</p>';
  }
  const citations=result.citations||[];
  const citationHtml=citations.slice(0,3).map(c=>{
    const href=c.deepLink||c.sourceUrl;
    return '<div class="policy-citation-mini"><div><b>'+String(c.sourceTitle||'Policy source')+'</b><small>'+String(c.locator||'Source')+'</small><q>'+String(c.excerpt||'')+'</q></div><a class="action-link" href="'+href+'" target="_blank" rel="noopener noreferrer">'+(c.kind==='pdf-page'?'Open PDF page':'Open policy')+' ↗</a></div>';
  }).join('');
  return '<span class="policy-chip '+(result.status==='POLICY_CONFLICT_CANDIDATE'?'danger':'warning')+'">'+result.status.replaceAll('_',' ')+'</span><p class="drawer-copy">'+result.reason+'</p>'+citationHtml;
}

function openClaim(data){
  if(!data) return;
  document.getElementById('drawerTitle').textContent=`${data.id} · ${data.year}`;
  const changed=data.initial!==data.rebuttal;
  document.getElementById('drawerContent').innerHTML=`
    <div class="drawer-section"><h3>Plain-English status</h3>
      <div class="claim-verdict ${data.rebuttal==='A'?'verdict-good':'verdict-risk'}"><strong>${data.rebuttal==='A'?'Supported after rebuttal':'Still at risk after rebuttal'}</strong><span>${transitionLabel(data)}</span></div>
    </div>
    <div class="drawer-section"><h3>Claim context</h3>
      <div class="evidence-line"><span>Year of service</span><span>${data.year}</span></div>
      <div class="evidence-line"><span>CPT / units</span><span>${data.cpt} · ${data.units}</span></div>
      <div class="evidence-line"><span>Amount charged</span><span>${money(data.charged)}</span></div>
      <div class="evidence-line"><span>Amount paid / sampled exposure</span><span>${money(data.paid)}</span></div>
      <div class="evidence-line"><span>Provider reference</span><span>${data.provider}</span></div>
    </div>
    <div class="drawer-section"><h3>Review history</h3>
      <div class="review-history"><div><small>Initial review</small><b>${data.initial==='A'?'A · Documentation supported':'B · Documentation not supported'}</b></div><div class="arrow">→</div><div><small>Rebuttal review</small><b>${data.rebuttal==='A'?'A · Supported':'B · Not supported'}</b></div></div>
      ${changed?'<div class="source-box">The outcome changed after rebuttal review. AuditDefend keeps the original finding and the new reason separate so counsel can see exactly what changed.</div>':''}
    </div>
    <div class="drawer-section"><h3>Why it matters</h3><p class="drawer-copy">${primaryReason(data)}.</p>
      <div class="source-box">Payer worksheet structure, redacted for this public sample. Original source documents are excluded because they contain patient or member identifiers.</div>
    </div>
    <div class="drawer-section"><h3>Next evidence to verify</h3><p class="drawer-copy">${data.rebuttal==='A'?'Preserve the supporting documentation and payer decision in the final case binder.':'Confirm the exact payer/program rule, documentation cited by the reviewer, and the provider enrollment effective date applicable to this date of service.'}</p><button class="primary-btn" data-toast="This public sample does not save review-state changes.">Mark for attorney review</button></div>`;
  const drawer=document.getElementById('claimDrawer');drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');
}

document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-view]');if(nav){showView(nav.dataset.view);return}
  const target=e.target.closest('[data-view-target]');if(target){showView(target.dataset.viewTarget);return}
  const toastBtn=e.target.closest('[data-toast]');if(toastBtn){toast(toastBtn.dataset.toast);return}
  const close=e.target.closest('[data-close-drawer]');if(close){const d=document.getElementById('claimDrawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');return}
  const claimBtn=e.target.closest('[data-claim-id]');if(claimBtn){openClaim(claims.find(c=>c.id===claimBtn.dataset.claimId));return}
  const tab=e.target.closest('.tab');if(tab){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');renderFindings(tab.dataset.filter);return}
});

document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('globalSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim().toLowerCase();const hit=claims.find(c=>c.id.toLowerCase()===q||c.cpt===q);toast(hit?`${hit.id}: ${transitionLabel(hit)} · ${primaryReason(hit)}`:(q?'No matching redacted claim ID in this demo.':'Enter a claim ID such as CL-004.'))}});
document.getElementById('auditFile')?.addEventListener('change',e=>{const f=e.target.files[0];document.getElementById('fileStatus').textContent=f?`${f.name} selected on this device — secure upload is not available.`:'No file selected'});

renderDashboardSummary();
renderFindings();
renderClaims();
renderGaps();
renderProviderMatrix();
renderCounselIssueMap();
const initial=location.hash.replace('#','');showView(initial||'dashboard');
