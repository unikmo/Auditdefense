(() => {
  const KEY='auditdefend-provider-evidence-demo-v3';
  const claims=window.AuditDefendCaseData?.claims||[];
  const caseContext=window.AuditDefendCaseData?.caseContext||{};
  const sourceEvidence=window.AuditDefendCaseData?.evidenceReconciliation?.records||{};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const emptyState=()=>({documents:[],unavailable:[],lastRun:null});
  let state=(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY));return saved?{...emptyState(),...saved}:emptyState()}catch{return emptyState()}})();
  let filter='all',search='';
  const typeLabel={"source-match":'Verified source match',"session-note":'Session / SOAP note',signature:'Signed record',"treatment-plan":'Treatment plan / assessment',enrollment:'Enrollment record',authorization:'Authorization',"submission-proof":'Proof sent to payer',other:'Other record'};
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  function toast(message){const node=$('providerWorkspaceToast');node.textContent=message;node.classList.add('show');clearTimeout(window.__pwToast);window.__pwToast=setTimeout(()=>node.classList.remove('show'),3000)}
  function sourceEvidenceFor(id){return sourceEvidence[id]||null}
  function userDocumentsFor(id){return state.documents.filter(item=>item.claimId===id)}
  function documentsFor(id){
    const matched=sourceEvidenceFor(id);
    const seeded=matched?[{claimId:id,type:'source-match',source:matched.source,version:'source verified',name:matched.locator,note:matched.matchBasis,seeded:true}]:[];
    return [...seeded,...userDocumentsFor(id)];
  }
  function isPayerAccepted(claim){return claim.rebuttal==='A'}
  function requiresDocumentationEvidence(claim){return claim.issues?.includes('Documentation support')}
  function hasSubmissionProof(claim){return documentsFor(claim.id).some(d=>d.type==='submission-proof'||d.version==='submitted'||d.version==='rebuttal')}
  function resultFor(claim){
    const docs=documentsFor(claim.id),matchedSource=sourceEvidenceFor(claim.id),hasVerifiedSource=matchedSource?.status==='verified',hasSupport=docs.some(d=>d.type!=='submission-proof'),hasSubmission=docs.some(d=>d.type==='submission-proof'||d.version==='submitted'||d.version==='rebuttal');
    if(isPayerAccepted(claim))return{status:'accepted',label:'Evidence accepted by payer',found:'Anthem marked this claim supported',next:'Keep the payer decision and related records with the case.'};
    if(!requiresDocumentationEvidence(claim))return{status:'other',label:'Other claim issue',found:claim.issues?.includes('NPI enrollment on DOS')?'Payer identifies an NPI enrollment issue':'No documentation-support finding remains on this row',next:claim.issues?.includes('NPI enrollment on DOS')?'Review enrollment, effective-date and billing-entity records.':'Review the registration or other payer issue shown.'};
    if(hasVerifiedSource)return{status:'source-found',label:'Evidence available for rebuttal review',found:'Matching provider record located',next:'Compare it with the payer finding. If it answers the finding, include it in the rebuttal and keep proof of delivery.'};
    if(state.unavailable.includes(claim.id))return{status:'not-found',label:'Evidence not found',found:'Provider confirmed the requested evidence cannot be supplied',next:'Keep this factual status for attorney review.'};
    if(hasSupport)return{status:'source-found',label:'Evidence available for rebuttal review',found:hasSubmission?'Provider record and sending history are linked':'A provider record is linked to this claim',next:hasSubmission?'Keep both items together for attorney review.':'Compare it with the payer finding. If responsive, include it in the rebuttal and record delivery.'};
    return{status:'needs-evidence',label:'Still needs evidence',found:docs.length?'Only sending history is linked; the supporting record is still needed':'No supporting record has been matched to this claim',next:'Link a supporting record or confirm that it cannot be supplied.'};
  }
  function results(){return claims.map(claim=>({claim,...resultFor(claim)}))}
  function money(value){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value||0)}
  function renderKpis(){
    const rows=results(),counts={'accepted':0,'needs-evidence':0,'source-found':0,'not-found':0,'other':0};rows.forEach(r=>counts[r.status]++);
    const requested=caseContext.recordsRequestEntries||rows.length;
    const submitted=claims.filter(hasSubmissionProof).length;
    const payerMissing=rows.filter(r=>requiresDocumentationEvidence(r.claim)&&!isPayerAccepted(r.claim)).length;
    const providerFound=rows.filter(r=>requiresDocumentationEvidence(r.claim)&&!isPayerAccepted(r.claim)&&r.status==='source-found').length;
    const providerMissing=rows.filter(r=>requiresDocumentationEvidence(r.claim)&&!isPayerAccepted(r.claim)&&['needs-evidence','not-found'].includes(r.status)).length;
    const cards=[
      {kind:'insurer-request',icon:'01',n:requested,title:'Requested by insurer',copy:'Records listed in Anthem’s initial request.',action:'View reviewed claims',filter:'all'},
      {kind:'submitted',icon:'02',n:submitted?submitted:'Not verified',title:'Evidence submitted to insurer',copy:'Claims with proof showing what was delivered to Anthem.',action:'Add submission proof',target:'documents'},
      {kind:'accepted',icon:'03',n:counts.accepted,title:'Evidence accepted by insurer',copy:'Claims Anthem later marked supported.',action:'View accepted claims',filter:'accepted'},
      {kind:'payer-missing',icon:'04',n:payerMissing,title:'Insurer says evidence is missing',copy:'Documentation findings Anthem still treated as unsupported.',action:'View insurer findings',filter:'payer-missing'},
      {kind:'provider-found',icon:'05',n:providerFound,title:'Provider evidence located',copy:'Those insurer findings now have a matching provider record.',action:'Review located evidence',filter:'source-found'},
      {kind:'provider-missing',icon:'06',n:providerMissing,title:'Provider evidence still missing',copy:'Claims needing a record upload or an explanation of why it is unavailable.',action:'Resolve missing evidence',filter:'provider-missing'}
    ];
    $('providerKpis').innerHTML=cards.map(x=>`<article class="pw-kpi ${x.kind}"><div class="pw-kpi-top"><span class="pw-kpi-icon">${x.icon}</span><strong class="${typeof x.n==='string'?'text-value':''}">${x.n}</strong></div><h2>${x.title}</h2><p>${x.copy}</p><button ${x.target?`data-provider-target="${x.target}"`:`data-provider-filter="${x.filter}"`}>${x.action} →</button></article>`).join('');
    $('missingBadge').textContent=providerMissing;$('resultBadge').textContent=rows.length;
    $('nextStepCount').textContent=providerMissing?`Resolve evidence for ${providerMissing} claims`:submitted<providerFound?`Confirm what was sent for ${providerFound} located records`:'No provider evidence remains unmatched';
    const located=(caseContext.located97153Matches||0)+(caseContext.located97155Matches||0);if($('providerSourceCount'))$('providerSourceCount').textContent=located
  }
  function payerFinding(claim){return claim.issues?.length?claim.issues.join(' + '):'Supported'}
  function matchesFilter(row,value){if(value==='all')return true;if(value==='payer-missing')return requiresDocumentationEvidence(row.claim)&&!isPayerAccepted(row.claim);if(value==='provider-missing')return ['needs-evidence','not-found'].includes(row.status);if(value==='submitted')return hasSubmissionProof(row.claim);return row.status===value}
  function renderResults(){let rows=results();if(filter!=='all')rows=rows.filter(r=>matchesFilter(r,filter));if(search){const q=search.toLowerCase();rows=rows.filter(r=>`${r.claim.id} ${r.claim.year} ${r.claim.cpt} ${payerFinding(r.claim)}`.toLowerCase().includes(q))}$('providerResultsBody').innerHTML=rows.map(r=>{const docs=documentsFor(r.claim.id),canMarkUnavailable=r.status==='needs-evidence';return `<tr><td><b>${esc(r.claim.id)}</b><span>${r.claim.year} · ${money(r.claim.paid)} paid</span></td><td><b>CPT ${esc(r.claim.cpt)}</b><span>${r.claim.units} units</span></td><td><b>${esc(payerFinding(r.claim))}</b><span>Payer result: ${r.claim.rebuttal==='A'?'supported':'not supported'}</span></td><td><b>${esc(r.found)}</b><span>${docs.length} linked record${docs.length===1?'':'s'}</span></td><td><span class="pw-status status-${r.status}">${r.label}</span></td><td><b>${esc(r.next)}</b><div class="pw-row-actions"><button data-add-for="${esc(r.claim.id)}">${r.status==='accepted'?'Add related record':'Add record'}</button>${r.status==='not-found'?`<button data-restore-for="${esc(r.claim.id)}">Restore review</button>`:canMarkUnavailable?`<button data-unavailable-for="${esc(r.claim.id)}">Cannot provide</button>`:''}</div></td></tr>`}).join('');$('providerResultCount').textContent=`Showing ${rows.length} of ${claims.length} claims`}
  function renderMissing(){const rows=results().filter(r=>['needs-evidence','not-found'].includes(r.status));$('providerMissingList').innerHTML=rows.map(r=>`<article><div><h3>${esc(r.claim.id)}</h3><p>${r.claim.year} · CPT ${esc(r.claim.cpt)} · ${money(r.claim.paid)} paid</p></div><div><h3>${esc(payerFinding(r.claim))}</h3><p>${r.status==='not-found'?'Provider confirmed that the requested evidence cannot currently be supplied.':'No matching provider record has been located yet.'}</p></div><div class="pw-row-actions"><button data-add-for="${esc(r.claim.id)}">Add record</button>${r.status==='not-found'?`<button data-restore-for="${esc(r.claim.id)}">Resume search</button>`:`<button data-unavailable-for="${esc(r.claim.id)}">Explain unavailable</button>`}</div></article>`).join('')||'<section class="pw-card"><h2>No provider evidence is currently missing</h2><p>Every documentation finding in the reviewed worksheet has a matching provider source record. Submission history and payer receipt still require separate verification.</p></section>'}
  function renderRecent(){const rows=state.documents.slice(-5).reverse();$('recentDocuments').innerHTML='<h3>Recently linked records</h3>'+(rows.length?rows.map(d=>`<article><b>${esc(d.claimId)} · ${esc(typeLabel[d.type]||d.type)}</b><span> — ${esc(d.source)} · ${esc(d.version)}</span></article>`).join(''):'<p>No claim-level records linked yet.</p>')}
  function render(){renderKpis();renderResults();renderMissing();renderRecent()}
  function showView(view){document.querySelectorAll('.pw-view').forEach(node=>node.classList.toggle('active',node.id===`provider-view-${view}`));document.querySelectorAll('[data-provider-view]').forEach(node=>node.classList.toggle('active',node.dataset.providerView===view));$('providerSidebar').classList.remove('open');history.replaceState(null,'',`#${view}`);scrollTo({top:0,behavior:'smooth'})}
  function runCheck(){state.lastRun=new Date().toISOString();save();render();toast('Document check complete. Provider results updated.')}
  $('providerClaimSelect').innerHTML=claims.map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${c.year} · CPT ${esc(c.cpt)}</option>`).join('');
  document.addEventListener('click',event=>{const nav=event.target.closest('[data-provider-view]');if(nav)return showView(nav.dataset.providerView);const category=event.target.closest('[data-provider-filter]');if(category){filter=category.dataset.providerFilter;$('providerStatusFilter').value=filter;renderResults();showView('results');return}const target=event.target.closest('[data-provider-target]');if(target)return showView(target.dataset.providerTarget);const add=event.target.closest('[data-add-for]');if(add){$('providerClaimSelect').value=add.dataset.addFor;showView('documents');return}const unavailable=event.target.closest('[data-unavailable-for]');if(unavailable){const id=unavailable.dataset.unavailableFor;if(confirm(`Mark ${id} as evidence not found because the provider cannot supply the requested record?`)){state.unavailable=[...new Set([...state.unavailable,id])];runCheck()}return}const restore=event.target.closest('[data-restore-for]');if(restore){state.unavailable=state.unavailable.filter(id=>id!==restore.dataset.restoreFor);runCheck();return}const message=event.target.closest('[data-message]');if(message)return toast(message.dataset.message)});
  $('providerMenu').addEventListener('click',()=>$('providerSidebar').classList.toggle('open'));
  $('providerDocumentForm').elements.file.addEventListener('change',event=>{$('providerFileState').textContent=event.target.files[0]?.name||'No file selected'});
  $('providerDocumentForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget),file=data.get('file'),claimId=String(data.get('claimId'));state.unavailable=state.unavailable.filter(id=>id!==claimId);state.documents.push({claimId,type:String(data.get('documentType')),source:String(data.get('source')),version:String(data.get('version')),name:file instanceof File&&file.size?file.name:'Location reference only',note:String(data.get('note')||'')});event.currentTarget.reset();$('providerFileState').textContent='No file selected';runCheck();showView('results')});
  $('providerStatusFilter').addEventListener('change',event=>{filter=event.target.value;renderResults()});$('providerClaimSearch').addEventListener('input',event=>{search=event.target.value.trim();renderResults()});$('runProviderCheck').addEventListener('click',runCheck);
  $('resetProviderDemo')?.addEventListener('click',()=>{state=emptyState();save();render();toast('Provider demonstration reset.')});
  render();showView((location.hash||'#home').slice(1));
})();
