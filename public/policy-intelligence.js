(() => {
const $=id=>document.getElementById(id);
const claims=window.AuditDefendCaseData?.claims||[];
const enrollmentClaims=claims.filter(c=>c.issues.includes('NPI enrollment on DOS'));
const reversals=claims.filter(c=>c.initial==='A'&&c.rebuttal==='B');
const initialDoc=claims.filter(c=>c.initial==='B');
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleString():'Not yet observed by scheduled monitor';

function renderCandidates(){
  const root=$('policyCandidates'); if(!root)return;
  const candidates=[
    {
      title:'Provider / NPI enrollment basis',
      status:'POLICY BASIS UNVERIFIED',
      tone:'warning',
      count:enrollmentClaims.length+' claim lines',
      detail:'The payer worksheet applies an enrollment-on-DOS finding. AuditDefend must identify the exact NY Medicaid / Anthem authority and version effective on each DOS before treating the policy basis as established.',
      next:'Map payer citation → policy version → enrollment effective-date evidence → affected claim universe.'
    },
    {
      title:'Rebuttal reversals',
      status:'HIGH-PRIORITY POLICY REVIEW',
      tone:'danger',
      count:reversals.length+' A → B lines',
      detail:'These lines passed the initial review and failed after rebuttal. That change should trigger automatic policy-source attribution rather than being accepted as a generic final denial.',
      next:'Identify the newly applied rule, its authority hierarchy and whether it was effective on the relevant DOS.'
    },
    {
      title:'Documentation support',
      status:'RULE ATTRIBUTION REQUIRED',
      tone:'info',
      count:initialDoc.length+' initially unsupported',
      detail:'Documentation findings need an exact source: payer reimbursement policy, provider manual, state Medicaid rule, program manual or other cited authority.',
      next:'Tie every documentation rationale to a versioned source and preserve the source page / section reference.'
    }
  ];
  root.innerHTML=candidates.map(c=>`<article class="policy-candidate ${c.tone}"><div><span class="policy-status">${esc(c.status)}</span><h3>${esc(c.title)}</h3><p>${esc(c.detail)}</p><small><b>Next:</b> ${esc(c.next)}</small></div><strong>${esc(c.count)}</strong></article>`).join('');
}

function renderClaimPolicyLinks(){
  const body=$('policyClaimRows'); if(!body)return;
  body.innerHTML=reversals.map(c=>`<tr><td><b>${c.id}</b></td><td>${c.year}</td><td>${c.cpt}</td><td>A → B</td><td>NPI enrollment on DOS</td><td><span class="policy-chip warning">Policy basis not yet verified</span></td><td>NY Medicaid + Anthem NY + enrollment evidence</td></tr>`).join('');
}

async function renderSources(){
  const table=$('policySourcesBody'), state=$('policyMonitorState'), count=$('policySourceCount'), alerts=$('policyChangeCount');
  if(!table)return;
  try{
    const [registry,status]=await Promise.all([
      fetch('/policy-sources.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('policy-sources.json unavailable'))),
      fetch('/policy-status.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('policy-status.json unavailable')))
    ]);
    const sourceMap=new Map(status.sources.map(s=>[s.id,s]));
    if(count)count.textContent=registry.sources.length;
    if(alerts)alerts.textContent=status.sources.filter(s=>s.reviewRequired).length;
    if(state){
      state.textContent=status.monitoringState==='ACTIVE'?'Monitor active · every 6 hours':status.monitoringState.replaceAll('_',' ')+' · '+status.schedule;
      state.className='policy-monitor-state '+(status.monitoringState==='ACTIVE'?'ok':'warn');
    }
    table.innerHTML=registry.sources.map(src=>{
      const obs=sourceMap.get(src.id)||{};
      const label=obs.state==='CHANGED_REVIEW_REQUIRED'?'Changed — review':obs.state==='FETCH_ERROR'?'Source error':obs.hash?'Observed':'Seeded';
      const tone=obs.state==='CHANGED_REVIEW_REQUIRED'||obs.state==='FETCH_ERROR'?'danger':obs.hash?'good':'warning';
      return `<tr><td><b>${esc(src.title)}</b><small>${esc(src.category)}</small></td><td>${esc(src.authority)}</td><td>${esc(src.program)}</td><td>${esc(src.cadence)}</td><td><span class="policy-chip ${tone}">${esc(label)}</span><small>${esc(fmtDate(obs.lastObservedAt))}</small></td><td><a class="action-link" href="${src.url}" target="_blank" rel="noopener noreferrer">Source ↗</a></td></tr>`;
    }).join('');
  }catch(error){
    if(state){state.textContent='Policy source registry could not be loaded.';state.className='policy-monitor-state warn'}
    table.innerHTML='<tr><td colspan="6">Policy source status unavailable.</td></tr>';
  }
}

renderCandidates();
renderClaimPolicyLinks();
renderSources();
})();