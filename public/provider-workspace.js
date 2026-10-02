(() => {
  const KEY='auditdefend-provider-evidence-demo-v3';
  const claims=window.AuditDefendCaseData?.claims||[];
  const caseContext=window.AuditDefendCaseData?.caseContext||{};
  const sourceEvidence=window.AuditDefendCaseData?.evidenceReconciliation?.records||{};
  const enrollmentClaims=claims.filter(claim=>claim.rebuttal!=='A'&&claim.issues?.includes('NPI enrollment on DOS'));
  const enrollmentClaimIds=enrollmentClaims.map(claim=>claim.id);
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const emptyState=()=>({documents:[],unavailable:[],issueResponses:{},lastRun:null});
  let state=(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY));return saved?{...emptyState(),...saved}:emptyState()}catch{return emptyState()}})();
  let filter='all',search='';
  const typeLabel={"source-match":'Verified source match',"session-note":'Session / SOAP note',signature:'Signed record',"treatment-plan":'Treatment plan / assessment',enrollment:'Enrollment record',authorization:'Authorization',"submission-proof":'Proof sent to payer',other:'Other record'};
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  function toast(message){const node=$('providerWorkspaceToast');node.textContent=message;node.classList.add('show');clearTimeout(window.__pwToast);window.__pwToast=setTimeout(()=>node.classList.remove('show'),3000)}
  function sourceEvidenceFor(id){return sourceEvidence[id]||null}
  function userDocumentsFor(id){return state.documents.filter(item=>item.claimId===id||item.appliesTo?.includes(id))}
  function documentsFor(id){
    const matched=sourceEvidenceFor(id);
    const seeded=matched?[{claimId:id,type:'source-match',source:matched.source,version:'source verified',name:matched.locator,note:matched.matchBasis,seeded:true}]:[];
    return [...seeded,...userDocumentsFor(id)];
  }
  function isPayerAccepted(claim){return claim.rebuttal==='A'}
  function requiresDocumentationEvidence(claim){return claim.issues?.includes('Documentation support')}
  function hasSubmissionProof(claim){return documentsFor(claim.id).some(d=>d.type==='submission-proof'||d.version==='submitted'||d.version==='rebuttal')}
  function enrollmentResponse(){return state.issueResponses?.enrollment||null}
  function enrollmentDocumentFor(id){return documentsFor(id).some(d=>d.type==='enrollment')}
  function enrollmentProgress(){
    const response=enrollmentResponse(),covered=enrollmentClaims.filter(claim=>enrollmentDocumentFor(claim.id)).length;
    const explained=response?.answer==='no'&&response.explanation?Math.max(0,enrollmentClaims.length-covered):0;
    return{response,covered,explained,awaiting:Math.max(0,enrollmentClaims.length-covered-explained)};
  }
  function resultFor(claim){
    const docs=documentsFor(claim.id),matchedSource=sourceEvidenceFor(claim.id),hasVerifiedSource=matchedSource?.status==='verified',hasSupport=docs.some(d=>d.type!=='submission-proof'),hasSubmission=docs.some(d=>d.type==='submission-proof'||d.version==='submitted'||d.version==='rebuttal');
    if(isPayerAccepted(claim))return{status:'accepted',label:'Evidence accepted by payer',found:'Anthem marked this claim supported',next:'Keep the payer decision and related records with the case.'};
    if(!requiresDocumentationEvidence(claim)){
      const progress=enrollmentProgress(),hasEnrollment=enrollmentDocumentFor(claim.id);
      const found=hasEnrollment?'Provider linked enrollment evidence':progress.response?.answer==='no'?'Provider explained why enrollment evidence is unavailable':progress.response?.answer==='yes'?'Provider says evidence is available; upload still required':'Provider response still required';
      const next=hasEnrollment?'Attorney reviews the provider-supplied record against the payer finding.':progress.response?.answer==='no'?'Keep the provider explanation with the claim for attorney review.':'Answer whether enrollment evidence is available.';
      return{status:'other',label:'Enrollment or other issue',found,next};
    }
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
    const submitted=caseContext.providerReportedSubmissionCount||0;
    const verifiedSubmissionProof=claims.filter(hasSubmissionProof).length,enrollment=enrollmentProgress();
    const payerMissing=rows.filter(r=>requiresDocumentationEvidence(r.claim)&&!isPayerAccepted(r.claim)).length;
    const providerFound=rows.filter(r=>requiresDocumentationEvidence(r.claim)&&!isPayerAccepted(r.claim)&&r.status==='source-found').length;
    const providerMissing=rows.filter(r=>requiresDocumentationEvidence(r.claim)&&!isPayerAccepted(r.claim)&&['needs-evidence','not-found'].includes(r.status)).length;
    const card=x=>`<article class="pw-kpi ${x.kind}"><div class="pw-kpi-top"><span class="pw-kpi-icon">${x.icon}</span><strong>${x.n}</strong></div><h2>${x.title}</h2><p>${x.copy}</p>${x.meta?`<small class="pw-kpi-meta">${x.meta}</small>`:''}<button ${x.target?`data-provider-target="${x.target}"`:`data-provider-filter="${x.filter}"`}>${x.action} →</button></article>`;
    const group=(step,title,equation,cards,columns)=>`<section class="pw-stage-group"><div class="pw-stage-head"><div><span>${step}</span><h2>${title}</h2></div><b>${equation}</b></div><div class="pw-stage-grid cols-${columns}">${cards.map(card).join('')}</div></section>`;
    $('providerKpis').innerHTML=
      group('STAGE 1 · ORIGINAL REQUEST','What Anthem requested and what the provider says was sent',`${requested} requested · ${submitted} provider-reported as submitted`,[
        {kind:'insurer-request',icon:'01',n:requested,title:'Requested by insurer',copy:'Records listed in Anthem’s December 2024 request.',action:'View 30 later worksheet rows',filter:'all'},
        {kind:'submitted',icon:'02',n:submitted,title:'Provider reports evidence submitted',copy:'The provider states that all requested records were shipped by hard copy and USB.',meta:'Provider statement · rebuttal attachment · not independently verified',action:'Review submission record',target:'documents'}
      ],2)+
      group('STAGE 2 · LATER INSURER WORKSHEET','How Anthem classified the 30 later worksheet rows',`${rows.length} = ${counts.accepted} accepted + ${payerMissing} documentation findings + ${counts.other} enrollment/other`,[
        {kind:'accepted',icon:'03',n:counts.accepted,title:'Accepted by insurer',copy:'Rows Anthem marked supported after rebuttal review.',action:'View accepted claims',filter:'accepted'},
        {kind:'payer-missing',icon:'04',n:payerMissing,title:'Documentation findings',copy:'Rows Anthem still treated as lacking or insufficient documentation.',action:'View documentation findings',filter:'payer-missing'},
        {kind:'other',icon:'05',n:counts.other,title:'Enrollment or other findings',copy:'Rows involving enrollment, effective date, registration or billing entity.',action:'View other findings',filter:'other'}
      ],3)+
      group('STAGE 3 · PROVIDER RECORD CHECK','Whether the provider can now identify records for the 22 documentation findings',`${payerMissing} = ${providerFound} records located + ${providerMissing} records still missing`,[
        {kind:'provider-found',icon:'06',n:providerFound,title:'Provider evidence located',copy:'Documentation findings with a matching provider source record. Located does not mean the claim is closed.',action:'Review located evidence',filter:'source-found'},
        {kind:'provider-missing',icon:'07',n:providerMissing,title:'Provider evidence still missing',copy:'Claims needing a record upload or an explanation of why it is unavailable.',action:'Resolve missing evidence',filter:'provider-missing'}
      ],2)+
      group('OPEN ISSUE · ENROLLMENT / REGISTRATION','Provider response to Anthem’s enrollment finding',`${enrollmentClaims.length} affected rows = ${enrollment.covered} with evidence + ${enrollment.explained} explained unavailable + ${enrollment.awaiting} awaiting`,[
        {kind:'other',icon:'08',n:enrollmentClaims.length,title:'Rows with an enrollment finding',copy:'This issue appears on the 22 documentation rows and the 5 enrollment-only rows.',action:'Answer evidence question',target:'missing'},
        {kind:'provider-found',icon:'09',n:enrollment.covered,title:'Enrollment evidence linked',copy:'Rows covered by a provider-supplied enrollment or credentialing record.',action:'Review linked evidence',filter:'enrollment'},
        {kind:'provider-missing',icon:'10',n:enrollment.awaiting,title:'Provider response still needed',copy:'Answer Yes and upload the record, or answer No and explain why it is unavailable.',action:'Complete provider response',target:'missing'}
      ],3);
    const openTasks=providerMissing+enrollment.awaiting;
    $('missingBadge').textContent=openTasks;$('resultBadge').textContent=rows.length;
    $('nextStepCount').textContent=providerMissing?`Resolve evidence for ${providerMissing} documentation findings`:enrollment.awaiting?`Answer the enrollment evidence question for ${enrollmentClaims.length} affected rows`:`Verify delivery of the provider-reported ${submitted}-record submission`;
    $('nextStepHelp').textContent=providerMissing?'Upload or identify the missing record. If it cannot be supplied, record why so your attorney sees the same status.':enrollment.awaiting?'If evidence exists, upload it and identify which claims it covers. If it does not, explain why so counsel sees the same factual response.':'All documentation findings have a provider source match and the enrollment question has a provider response. Now verify what was sent to the insurer.';
    const nextAction=$('nextStepAction');if(providerMissing){nextAction.textContent='Review missing evidence →';nextAction.dataset.providerFilter='provider-missing';delete nextAction.dataset.providerTarget}else if(enrollment.awaiting){nextAction.textContent='Answer enrollment question →';nextAction.dataset.providerTarget='missing';delete nextAction.dataset.providerFilter}else{nextAction.textContent=verifiedSubmissionProof?'Review submission proof →':'Add submission proof →';nextAction.dataset.providerTarget='documents';delete nextAction.dataset.providerFilter}
    const located=(caseContext.located97153Matches||0)+(caseContext.located97155Matches||0);if($('providerSourceCount'))$('providerSourceCount').textContent=located
  }
  function payerFinding(claim){return claim.issues?.length?claim.issues.join(' + '):'Supported'}
  function matchesFilter(row,value){if(value==='all')return true;if(value==='payer-missing')return requiresDocumentationEvidence(row.claim)&&!isPayerAccepted(row.claim);if(value==='provider-missing')return ['needs-evidence','not-found'].includes(row.status);if(value==='enrollment')return !isPayerAccepted(row.claim)&&row.claim.issues?.includes('NPI enrollment on DOS');if(value==='submitted')return hasSubmissionProof(row.claim);return row.status===value}
  function renderResults(){let rows=results();if(filter!=='all')rows=rows.filter(r=>matchesFilter(r,filter));if(search){const q=search.toLowerCase();rows=rows.filter(r=>`${r.claim.id} ${r.claim.year} ${r.claim.cpt} ${payerFinding(r.claim)}`.toLowerCase().includes(q))}$('providerResultsBody').innerHTML=rows.map(r=>{const docs=documentsFor(r.claim.id),canMarkUnavailable=r.status==='needs-evidence';return `<tr><td><b>${esc(r.claim.id)}</b><span>${r.claim.year} · ${money(r.claim.paid)} paid</span></td><td><b>CPT ${esc(r.claim.cpt)}</b><span>${r.claim.units} units</span></td><td><b>${esc(payerFinding(r.claim))}</b><span>Payer result: ${r.claim.rebuttal==='A'?'supported':'not supported'}</span></td><td><b>${esc(r.found)}</b><span>${docs.length} linked record${docs.length===1?'':'s'}</span></td><td><span class="pw-status status-${r.status}">${r.label}</span></td><td><b>${esc(r.next)}</b><div class="pw-row-actions"><button data-add-for="${esc(r.claim.id)}">${r.status==='accepted'?'Add related record':'Add record'}</button>${r.status==='not-found'?`<button data-restore-for="${esc(r.claim.id)}">Restore review</button>`:canMarkUnavailable?`<button data-unavailable-for="${esc(r.claim.id)}">Cannot provide</button>`:''}</div></td></tr>`}).join('');$('providerResultCount').textContent=`Showing ${rows.length} of ${claims.length} claims`}
  function renderMissing(){
    const rows=results().filter(r=>['needs-evidence','not-found'].includes(r.status)),enrollment=enrollmentProgress(),response=enrollment.response;
    const responseText=enrollment.covered?`${enrollment.covered} affected rows currently have linked enrollment evidence.${enrollment.explained?` ${enrollment.explained} remaining rows have a provider explanation.`:''}`:response?.answer==='no'?`Provider answered No. Explanation: ${esc(response.explanation)}`:response?.answer==='yes'?'Provider answered Yes. The supporting upload is still required.':'No provider response has been recorded yet.';
    const enrollmentPrompt=`<section class="pw-open-question"><div class="pw-open-question-head"><div><span>OPEN ENROLLMENT QUESTION</span><h2>Do you have evidence that addresses Anthem’s enrollment or registration finding?</h2><p>Anthem’s enrollment finding appears on ${enrollmentClaims.length} rows: the 22 documentation rows and the 5 enrollment-only rows. One record may cover multiple claims.</p></div><b>${enrollment.awaiting} awaiting</b></div><div class="pw-answer-status"><strong>${responseText}</strong><small>A provider response is recorded as a factual statement, not independently verified and not a legal conclusion.</small></div><div class="pw-answer-actions"><button class="pw-primary" data-enrollment-answer="yes">Yes — upload evidence</button><button class="pw-secondary" data-enrollment-answer="no">No — explain why</button></div></section>`;
    const documentation=rows.map(r=>`<article><div><h3>${esc(r.claim.id)}</h3><p>${r.claim.year} · CPT ${esc(r.claim.cpt)} · ${money(r.claim.paid)} paid</p></div><div><h3>${esc(payerFinding(r.claim))}</h3><p>${r.status==='not-found'?'Provider confirmed that the requested evidence cannot currently be supplied.':'No matching provider record has been located yet.'}</p></div><div class="pw-row-actions"><button data-add-for="${esc(r.claim.id)}">Add record</button>${r.status==='not-found'?`<button data-restore-for="${esc(r.claim.id)}">Resume search</button>`:`<button data-unavailable-for="${esc(r.claim.id)}">Explain unavailable</button>`}</div></article>`).join('')||'<section class="pw-card"><h2>No documentation records are currently missing</h2><p>All 22 documentation findings have a matching provider source record. They still require finding-by-finding review and do not automatically close the claims.</p></section>';
    $('providerMissingList').innerHTML=enrollmentPrompt+documentation;
  }
  function renderRecent(){const rows=state.documents.slice(-5).reverse();$('recentDocuments').innerHTML='<h3>Recently linked records</h3>'+(rows.length?rows.map(d=>`<article><b>${esc(d.claimId)} · ${esc(typeLabel[d.type]||d.type)}</b><span> — ${esc(d.source)} · ${esc(d.version)}</span></article>`).join(''):'<p>No claim-level records linked yet.</p>')}
  function render(){renderKpis();renderResults();renderMissing();renderRecent()}
  function showView(view){document.querySelectorAll('.pw-view').forEach(node=>node.classList.toggle('active',node.id===`provider-view-${view}`));document.querySelectorAll('[data-provider-view]').forEach(node=>node.classList.toggle('active',node.dataset.providerView===view));$('providerSidebar').classList.remove('open');history.replaceState(null,'',`#${view}`);scrollTo({top:0,behavior:'smooth'})}
  function runCheck(){state.lastRun=new Date().toISOString();save();render();toast('Document check complete. Provider results updated.')}
  $('providerClaimSelect').innerHTML=claims.map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${c.year} · CPT ${esc(c.cpt)}</option>`).join('');
  document.addEventListener('click',event=>{const nav=event.target.closest('[data-provider-view]');if(nav)return showView(nav.dataset.providerView);const category=event.target.closest('[data-provider-filter]');if(category){filter=category.dataset.providerFilter;$('providerStatusFilter').value=filter;renderResults();showView('results');return}const target=event.target.closest('[data-provider-target]');if(target)return showView(target.dataset.providerTarget);const enrollmentAnswer=event.target.closest('[data-enrollment-answer]');if(enrollmentAnswer){if(enrollmentAnswer.dataset.enrollmentAnswer==='yes'){state.issueResponses.enrollment={answer:'yes',explanation:'',updatedAt:new Date().toISOString()};save();$('providerClaimSelect').value=enrollmentClaimIds[0];$('providerDocumentType').value='enrollment';$('providerApplicationScope').value='enrollment-all';render();showView('documents');toast('Upload the enrollment evidence and identify its source.')}else{$('enrollmentExplanation').value=enrollmentResponse()?.explanation||'';$('enrollmentNoDialog').showModal()}return}const add=event.target.closest('[data-add-for]');if(add){$('providerClaimSelect').value=add.dataset.addFor;showView('documents');return}const unavailable=event.target.closest('[data-unavailable-for]');if(unavailable){const id=unavailable.dataset.unavailableFor;if(confirm(`Mark ${id} as evidence not found because the provider cannot supply the requested record?`)){state.unavailable=[...new Set([...state.unavailable,id])];runCheck()}return}const restore=event.target.closest('[data-restore-for]');if(restore){state.unavailable=state.unavailable.filter(id=>id!==restore.dataset.restoreFor);runCheck();return}const message=event.target.closest('[data-message]');if(message)return toast(message.dataset.message)});
  $('providerMenu').addEventListener('click',()=>$('providerSidebar').classList.toggle('open'));
  $('providerDocumentForm').elements.file.addEventListener('change',event=>{$('providerFileState').textContent=event.target.files[0]?.name||'No file selected'});
  $('providerDocumentForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget),file=data.get('file'),claimId=String(data.get('claimId')),type=String(data.get('documentType')),scope=String(data.get('applicationScope'));state.unavailable=state.unavailable.filter(id=>id!==claimId);const appliesTo=scope==='enrollment-all'&&type==='enrollment'?enrollmentClaimIds:[claimId];state.documents.push({claimId,appliesTo,type,source:String(data.get('source')),version:String(data.get('version')),name:file instanceof File&&file.size?file.name:'Location reference only',note:String(data.get('note')||'')});if(type==='enrollment')state.issueResponses.enrollment={answer:'yes',explanation:'',updatedAt:new Date().toISOString()};event.currentTarget.reset();$('providerFileState').textContent='No file selected';runCheck();showView(type==='enrollment'?'missing':'results')});
  $('enrollmentNoForm').addEventListener('submit',event=>{event.preventDefault();const explanation=$('enrollmentExplanation').value.trim();if(!explanation)return;state.issueResponses.enrollment={answer:'no',explanation,updatedAt:new Date().toISOString()};save();$('enrollmentNoDialog').close();render();showView('missing');toast('Explanation saved for attorney review.')});
  $('cancelEnrollmentExplanation').addEventListener('click',()=>$('enrollmentNoDialog').close());
  $('providerStatusFilter').addEventListener('change',event=>{filter=event.target.value;renderResults()});$('providerClaimSearch').addEventListener('input',event=>{search=event.target.value.trim();renderResults()});$('runProviderCheck').addEventListener('click',runCheck);
  $('resetProviderDemo')?.addEventListener('click',()=>{state=emptyState();save();render();toast('Provider demonstration reset.')});
  render();showView((location.hash||'#home').slice(1));
})();
